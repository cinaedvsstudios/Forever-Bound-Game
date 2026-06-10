// Obstacle Course / Horse Forest Runner V24
// Full-edge blur masks, softened path colour transitions, and GLB tree corridor regeneration.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

const ASSET_BASE = './assets/obstacle-course/horse-forest/';
const GROUND_Y = -1.62;
const SEGMENT = 8;

const ASSETS = {
  horse: `${ASSET_BASE}foreground/horse.png`,
  background: `${ASSET_BASE}backgrounds/horseridebg.jpg`,
  path: `${ASSET_BASE}ground/forest_floor_roots_tile_placeholder_1254.png`,
  grassA: `${ASSET_BASE}ground/forest_floor_grass.png`,
  grassB: `${ASSET_BASE}ground/forest_floor_grass2.png`,
  trees: [
    `${ASSET_BASE}3d/tree.glb`,
    `${ASSET_BASE}3d/tree_low-poly.glb`,
    `${ASSET_BASE}3d/hill_top_tree.glb`,
    `${ASSET_BASE}3d/small_pine.glb`,
    `${ASSET_BASE}3d/pine_with_awkward_teenage_face.glb`,
  ],
};

const TEMPLATES = {
  horse_forest_easy: { label: 'Horse Forest Ride', objective: 'Ride through the forest corridor. Follow the lighter path, jump logs, rocks, and streams, duck beneath low branches, and collect glowing items.', fog: 0x102018, clear: 0x7fa7b8, obstacleRate: 1 },
  horse_forest_dense: { label: 'Dense Forest Ride', objective: 'Ride through a tighter forest corridor. Trees stay outside the path.', fog: 0x07130d, clear: 0x6d93a7, obstacleRate: 1.35 },
  horse_forest_night: { label: 'Moonlit Forest Ride', objective: 'A darker ride through the same clear corridor.', fog: 0x060914, clear: 0x101832, obstacleRate: 1.15 },
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
  treeModels: [],
  treeLoadStarted: false,
  host: null,
  stage: null,
  panels: null,
  scene: null,
  camera: null,
  renderer: null,
  world: null,
  clock: null,
  frame: null,
  textureLoader: null,
  textureCache: new Map(),
  gltfLoaderPromise: null,
  groundMaterial: null,
  pathMaterial: null,
  featherInnerMaterial: null,
  featherOuterMaterial: null,
};

const oc$ = (id) => document.getElementById(id);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const rand = (min, max) => min + Math.random() * (max - min);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function pathCenterAt(distance) {
  return Math.sin(distance * 0.0048) * 2.1 + Math.sin(distance * 0.0125) * 0.85 + Math.sin(distance * 0.021) * 0.35;
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
    .obstacle-course-stage{height:100%;overflow:auto;padding:18px 20px 22px;background:#05080d;color:var(--cream,#f4ead4)}
    .obstacle-workspace{display:grid;grid-template-columns:minmax(600px,1fr) 292px;gap:14px;align-items:start}
    .obstacle-view-card,.obstacle-side-card{border:1px solid rgba(124,202,210,.24);border-radius:16px;background:rgba(7,14,22,.84);box-shadow:0 12px 34px rgba(0,0,0,.28)}
    .obstacle-view-card{padding:16px;display:flex;flex-direction:column;gap:12px}.obstacle-header-line{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid rgba(124,202,210,.18);padding-bottom:12px}.obstacle-header-line h2{font-family:'Cinzel',serif;margin:3px 0 0;font-size:1.38rem}.obstacle-header-line p{margin:8px 0 0;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.42}.obstacle-status-pill{border:1px solid rgba(238,196,90,.34);border-radius:999px;color:#eec45a;padding:6px 10px;font-size:.68rem;font-weight:900;white-space:nowrap}
    .obstacle-three-wrap{position:relative;aspect-ratio:16/9;border:1px solid rgba(124,202,210,.18);border-radius:18px;overflow:hidden;background:#07101c}.obstacle-three-wrap canvas{display:block;width:100%!important;height:100%!important;cursor:crosshair}
    .edge-blur{position:absolute;pointer-events:none;z-index:3;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
    .edge-blur.left{left:0;top:0;bottom:0;width:19%;background:linear-gradient(90deg,rgba(8,12,14,.54),rgba(8,12,14,.22) 45%,rgba(8,12,14,0));-webkit-mask-image:linear-gradient(90deg,#000 0%,#000 54%,transparent 100%);mask-image:linear-gradient(90deg,#000 0%,#000 54%,transparent 100%)}
    .edge-blur.right{right:0;top:0;bottom:0;width:19%;background:linear-gradient(270deg,rgba(8,12,14,.54),rgba(8,12,14,.22) 45%,rgba(8,12,14,0));-webkit-mask-image:linear-gradient(270deg,#000 0%,#000 54%,transparent 100%);mask-image:linear-gradient(270deg,#000 0%,#000 54%,transparent 100%)}
    .edge-blur.top{left:0;right:0;top:0;height:19%;background:linear-gradient(180deg,rgba(8,12,14,.42),rgba(8,12,14,.12) 48%,rgba(8,12,14,0));-webkit-mask-image:linear-gradient(180deg,#000 0%,#000 46%,transparent 100%);mask-image:linear-gradient(180deg,#000 0%,#000 46%,transparent 100%)}
    .edge-blur.bottom{left:0;right:0;bottom:0;height:23%;background:linear-gradient(0deg,rgba(10,8,5,.60),rgba(10,8,5,.20) 48%,rgba(10,8,5,0));-webkit-mask-image:linear-gradient(0deg,#000 0%,#000 52%,transparent 100%);mask-image:linear-gradient(0deg,#000 0%,#000 52%,transparent 100%)}
    .obstacle-hud{position:absolute;left:14px;right:14px;bottom:12px;z-index:6;display:flex;justify-content:space-between;gap:12px;pointer-events:none;color:var(--cream,#f4ead4);font-size:.74rem;text-shadow:0 2px 5px rgba(0,0,0,.8)}
    .obstacle-horse-overlay{position:absolute;left:50%;bottom:-26px;z-index:5;width:330px;height:190px;margin-left:-165px;pointer-events:none;filter:drop-shadow(0 7px 9px rgba(0,0,0,.72));opacity:.98;background:url('${ASSETS.horse}') center bottom / contain no-repeat}.obstacle-horse-overlay i{display:none}.obstacle-reticle{position:absolute;left:50%;top:50%;z-index:4;width:34px;height:34px;margin:-17px 0 0 -17px;border:1px solid rgba(238,196,90,.35);border-radius:50%;box-shadow:0 0 16px rgba(238,196,90,.16);pointer-events:none}.obstacle-reticle:before,.obstacle-reticle:after{content:'';position:absolute;background:rgba(238,196,90,.45)}.obstacle-reticle:before{left:50%;top:-8px;width:1px;height:50px}.obstacle-reticle:after{top:50%;left:-8px;width:50px;height:1px}
    .obstacle-help-strip{display:flex;justify-content:space-between;gap:10px;color:var(--muted,#c9bfae);font-size:.72rem;line-height:1.35}.obstacle-control-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.obstacle-control-row button,.obstacle-mini-grid button{min-height:38px;border:1px solid rgba(124,202,125,.28);border-radius:9px;background:rgba(20,72,37,.58);color:var(--cream,#f4ead4);font-weight:900}.obstacle-side-card{padding:16px 14px;display:flex;flex-direction:column;gap:11px}.obstacle-side-card h3{font-family:'Cinzel',serif;margin:0;font-size:1.03rem}.obstacle-metric{display:flex;justify-content:space-between;border:1px solid rgba(124,202,210,.2);border-radius:11px;padding:10px;color:var(--muted,#c9bfae);font-size:.76rem}.obstacle-metric strong{color:var(--cream,#f4ead4)}.obstacle-result{min-height:64px;border:1px solid rgba(124,202,210,.22);border-radius:11px;padding:11px;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.4}.obstacle-result[data-state='success']{border-color:#69ad70;color:#9ee6a4;background:#214b2b}.obstacle-result[data-state='failure']{border-color:#cc6d55;color:#f0a088;background:#4a1d1a}.obstacle-result[data-state='warn']{border-color:#c9a64a;color:#eec45a;background:#3c2c12}.obstacle-panel-copy{font-size:.73rem;line-height:1.46;color:var(--muted,#c9bfae);margin:0 0 14px}.obstacle-score-block{padding:12px;margin:0 0 10px;border-radius:11px;background:rgba(20,35,54,.42);border:1px solid rgba(124,202,210,.17)}.obstacle-score-block small{display:block;color:#eec45a;font-size:.63rem;letter-spacing:.13em;text-transform:uppercase;font-weight:800;margin-bottom:7px}.obstacle-score-block p{margin:0;font-size:.77rem;line-height:1.5;color:var(--cream,#f4ead4)}.obstacle-mini-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.asset-list-code{font-size:.62rem;line-height:1.45;white-space:pre-wrap;word-break:break-word;color:#c8e6ca;background:rgba(0,0,0,.28);border:1px solid rgba(124,202,125,.18);border-radius:10px;padding:9px}
    @media(max-width:1080px){.obstacle-workspace{grid-template-columns:1fr}.obstacle-side-card{min-height:220px}}
  `;
  document.head.appendChild(style);
}

export function openObstacleCourseWorkflow() {
  ensureMounted();
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

function ensureMounted() {
  if (OC.mounted) return;
  injectStyles();
  const rightPanel = document.querySelector('.right-panel');
  const leftBody = document.querySelector('.left-panel-body');
  if (!rightPanel || !leftBody) return;
  OC.stage = document.createElement('section');
  OC.stage.id = 'obstacle-course-stage';
  OC.stage.className = 'obstacle-course-stage';
  OC.stage.hidden = true;
  OC.stage.innerHTML = `<div class="obstacle-workspace"><section class="obstacle-view-card"><div class="obstacle-header-line"><div><p class="eyebrow">Obstacle Course · Horse Forest Runner V24</p><h2 id="obstacle-title">Horse Forest Ride</h2><p id="obstacle-objective"></p></div><span id="obstacle-status" class="obstacle-status-pill">Ready</span></div><div id="obstacle-three-host" class="obstacle-three-wrap"><div class="obstacle-reticle"></div><div class="edge-blur left"></div><div class="edge-blur right"></div><div class="edge-blur top"></div><div class="edge-blur bottom"></div><div class="obstacle-horse-overlay"><i></i></div><div class="obstacle-hud"><span>A/D or arrows steer · Space/W/Up jumps · S/Down ducks</span><span id="obstacle-course-summary">0m / 0m</span></div></div><div class="obstacle-help-strip"><span>Blur is applied to all four viewport edges. Path transition has multiple feather layers.</span><span>GLB trees only.</span></div><div class="obstacle-control-row"><button id="obstacle-start" type="button">Start Test</button><button id="obstacle-pause" type="button">Pause</button><button id="obstacle-reset-run" type="button">Reset Run</button></div></section><aside class="obstacle-side-card"><p class="eyebrow">Ride Result</p><h3>Score</h3><div class="obstacle-metric"><span>Score</span><strong id="obstacle-score">0</strong></div><div class="obstacle-metric"><span>Collected</span><strong id="obstacle-collected">0</strong></div><div class="obstacle-metric"><span>Hits</span><strong id="obstacle-hits">0</strong></div><div class="obstacle-metric"><span>Jumps</span><strong id="obstacle-jumps">0</strong></div><div class="obstacle-metric"><span>Target Score</span><strong id="obstacle-target-score">20</strong></div><div id="obstacle-result" class="obstacle-result" aria-live="polite">Ride waiting. Start the test when ready.</div></aside></div>`;
  rightPanel.prepend(OC.stage);
  OC.panels = document.createElement('div');
  OC.panels.id = 'obstacle-course-panels';
  OC.panels.hidden = true;
  OC.panels.innerHTML = `<section class="panel tool-panel obstacle-panel" data-obstacle-panel="build"><div class="panel-title-row"><div><p class="eyebrow">01 · Construction</p><h2>Horse Ride</h2></div><span class="status-pill is-waiting">V24</span></div><p class="obstacle-panel-copy">Fixed background, blended ground, softened path, GLB trees only.</p><label class="field-block"><span>Course Template</span><select id="obstacle-template"><option value="horse_forest_easy">Horse Forest Ride</option><option value="horse_forest_dense">Dense Forest Ride</option><option value="horse_forest_night">Moonlit Forest Ride</option></select></label><label class="range-row"><span>Difficulty <output id="obstacle-difficulty-out">2</output></span><input id="obstacle-difficulty" type="range" min="1" max="5" value="2" /></label><label class="range-row"><span>Course Duration <output id="obstacle-duration-out">45s</output></span><input id="obstacle-duration" type="range" min="20" max="80" step="5" value="45" /></label><button id="obstacle-regenerate" class="wide-button" type="button">Regenerate Horse Course</button></section><section class="panel tool-panel obstacle-panel" data-obstacle-panel="display" hidden><div class="panel-title-row"><div><p class="eyebrow">02 · Display</p><h2>Ground Relief</h2></div></div><p class="obstacle-panel-copy">Noise alpha blends all three ground images. Path edge uses multiple transparent feather strips.</p><label class="range-row"><span>Bump Strength <output id="obstacle-bump-out">0.12</output></span><input id="obstacle-bump" type="range" min="0" max="0.45" step="0.01" value="0.12" /></label><label class="range-row"><span>Displacement Strength <output id="obstacle-displacement-out">0.035</output></span><input id="obstacle-displacement" type="range" min="0" max="0.18" step="0.005" value="0.035" /></label><label class="range-row"><span>Horse Speed <output id="obstacle-speed-out">34</output></span><input id="obstacle-speed" type="range" min="18" max="64" step="2" value="34" /></label><label class="range-row"><span>Lane Width <output id="obstacle-lane-width-out">2.7</output></span><input id="obstacle-lane-width" type="range" min="1.8" max="5" step="0.1" value="2.7" /></label><div class="asset-list-code">Background: backgrounds/horseridebg.jpg\nPath: forest_floor_roots_tile_placeholder_1254.png\nGround blend: roots + grass + grass2\nTrees: GLB only</div></section><section class="panel tool-panel obstacle-panel" data-obstacle-panel="logic" hidden><div class="panel-title-row"><div><p class="eyebrow">03 · Logic</p><h2>Scoring + Events</h2></div></div><div class="obstacle-score-block"><small>Scoring</small><p>Collect glowing item: +5. Hit log/rock/branch/stream: -1.</p></div><label class="range-row"><span>Success Score <output id="obstacle-success-score-out">20</output></span><input id="obstacle-success-score" type="range" min="0" max="80" step="5" value="20" /></label><label class="field-block"><span>Success Event ID</span><input id="obstacle-success-event" type="text" value="obstacle_course_success" /></label><label class="field-block"><span>Success Quest Outcome Key</span><input id="obstacle-success-outcome" type="text" value="horse_forest_success" /></label><label class="field-block"><span>Failure Event ID</span><input id="obstacle-failure-event" type="text" value="obstacle_course_failure" /></label><label class="field-block"><span>Failure Quest Outcome Key</span><input id="obstacle-failure-outcome" type="text" value="horse_forest_failure" /></label></section><section class="panel tool-panel obstacle-panel" data-obstacle-panel="visuals" hidden><div class="panel-title-row"><div><p class="eyebrow">04 · Density</p><h2>Route Pieces</h2></div></div><p class="obstacle-panel-copy">Scattered GLB trees, rocks, and ferns stay beside the path.</p><div class="obstacle-mini-grid"><button id="obstacle-add-obstacles" type="button">More Obstacles</button><button id="obstacle-add-collectibles" type="button">More Collectibles</button></div></section>`;
  leftBody.appendChild(OC.panels);
  OC.host = oc$('obstacle-three-host');
  setupThreeScene();
  bindControls();
  OC.mounted = true;
}

function setupThreeScene() {
  OC.textureLoader = new THREE.TextureLoader();
  OC.scene = new THREE.Scene();
  OC.camera = new THREE.PerspectiveCamera(66, 16 / 9, 0.1, 1000);
  OC.camera.position.set(0, 1.55, 7.8);
  OC.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  OC.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  OC.host.prepend(OC.renderer.domElement);
  OC.clock = new THREE.Clock();
  OC.scene.add(new THREE.AmbientLight(0xd8f0ff, 0.84));
  const sun = new THREE.DirectionalLight(0xfff0d0, 1.0);
  sun.position.set(-8, 16, 12);
  OC.scene.add(sun);
  OC.world = new THREE.Group();
  OC.scene.add(OC.world);
  buildGroundMaterial();
  loadTreeModels();
  window.addEventListener('resize', resizeRenderer);
  resizeRenderer();
}

function bindControls() {
  oc$('obstacle-template').addEventListener('change', (e) => { OC.templateId = e.target.value; regenerateCourse(); });
  oc$('obstacle-difficulty').addEventListener('input', (e) => { OC.difficulty = Number(e.target.value); oc$('obstacle-difficulty-out').textContent = String(OC.difficulty); regenerateCourse(); });
  oc$('obstacle-duration').addEventListener('input', (e) => { OC.duration = Number(e.target.value); oc$('obstacle-duration-out').textContent = `${OC.duration}s`; regenerateCourse(); });
  oc$('obstacle-speed').addEventListener('input', (e) => { OC.speed = Number(e.target.value); oc$('obstacle-speed-out').textContent = String(OC.speed); regenerateCourse(); });
  oc$('obstacle-lane-width').addEventListener('input', (e) => { OC.laneWidth = Number(e.target.value); oc$('obstacle-lane-width-out').textContent = OC.laneWidth.toFixed(1); regenerateCourse(); });
  oc$('obstacle-bump').addEventListener('input', (e) => { OC.bumpStrength = Number(e.target.value); oc$('obstacle-bump-out').textContent = OC.bumpStrength.toFixed(2); updateGroundRelief(); });
  oc$('obstacle-displacement').addEventListener('input', (e) => { OC.displacementStrength = Number(e.target.value); oc$('obstacle-displacement-out').textContent = OC.displacementStrength.toFixed(3); updateGroundRelief(); });
  oc$('obstacle-success-score').addEventListener('input', (e) => { OC.successScore = Number(e.target.value); oc$('obstacle-success-score-out').textContent = String(OC.successScore); oc$('obstacle-target-score').textContent = String(OC.successScore); });
  oc$('obstacle-success-event').addEventListener('input', (e) => { OC.successEventId = e.target.value; });
  oc$('obstacle-failure-event').addEventListener('input', (e) => { OC.failureEventId = e.target.value; });
  oc$('obstacle-success-outcome').addEventListener('input', (e) => { OC.successOutcomeKey = e.target.value; });
  oc$('obstacle-failure-outcome').addEventListener('input', (e) => { OC.failureOutcomeKey = e.target.value; });
  oc$('obstacle-regenerate').addEventListener('click', regenerateCourse);
  oc$('obstacle-start').addEventListener('click', startRun);
  oc$('obstacle-pause').addEventListener('click', pauseRun);
  oc$('obstacle-reset-run').addEventListener('click', () => resetRun(false));
  oc$('obstacle-add-obstacles').addEventListener('click', () => { addObstacles(7); drawFrame(); });
  oc$('obstacle-add-collectibles').addEventListener('click', () => { addCollectibles(6); drawFrame(); });
  window.addEventListener('keydown', (event) => {
    if (!OC.active) return;
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(key)) {
      event.preventDefault();
      OC.keys.add(key);
      if (['arrowup', 'w', ' '].includes(key)) jumpHorse();
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
  const height = Math.max(300, Math.round(width * 9 / 16));
  OC.camera.aspect = width / height;
  OC.camera.updateProjectionMatrix();
  OC.renderer.setSize(width, height);
}

function smoothstep(a, b, x) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

function noise(x, y, seed = 0) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return n - Math.floor(n);
}

function valueNoise(x, y, seed = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = noise(xi, yi, seed), b = noise(xi + 1, yi, seed), c = noise(xi, yi + 1, seed), d = noise(xi + 1, yi + 1, seed);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

function fbm(x, y, seed = 0) {
  let value = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < 5; i += 1) { value += valueNoise(x * freq, y * freq, seed + i * 13.1) * amp; freq *= 2; amp *= 0.5; }
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
    const [pathImg, grassAImg, grassBImg] = await Promise.all([loadImage(ASSETS.path), loadImage(ASSETS.grassA), loadImage(ASSETS.grassB)]);
    const pathData = getImageData(pathImg, size), grassAData = getImageData(grassAImg, size), grassBData = getImageData(grassBImg, size);
    const colorCanvas = document.createElement('canvas'), bumpCanvas = document.createElement('canvas');
    colorCanvas.width = bumpCanvas.width = size;
    colorCanvas.height = bumpCanvas.height = size;
    const colorCtx = colorCanvas.getContext('2d'), bumpCtx = bumpCanvas.getContext('2d');
    const colorImage = colorCtx.createImageData(size, size), bumpImage = bumpCtx.createImageData(size, size);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const u = x / size, v = y / size;
        const n1 = fbm(u * 7, v * 7, 1), n2 = fbm(u * 18, v * 18, 5);
        const rootPatch = smoothstep(0.66, 0.94, fbm(u * 4.4 + 12, v * 4.4 - 3, 21)) * 0.22;
        const sideMix = smoothstep(0.18, 0.82, fbm(u * 5.5 + 31, v * 5.5 - 8, 9));
        const sx = (u * size * 2.8 + n2 * 18) % size, sy = (v * size * 2.8 + n1 * 18) % size;
        const pathCol = sample(pathData, size, sx, sy);
        const grassA = sample(grassAData, size, sx * 1.2, sy * 1.2);
        const grassB = sample(grassBData, size, sx * 1.1 + 80, sy * 1.1 + 40);
        const sideCol = grassA.map((c, i) => c * (1 - sideMix) + grassB[i] * sideMix);
        const idx = (y * size + x) * 4;
        [0, 1, 2].forEach((i) => { colorImage.data[idx + i] = clamp(pathCol[i] * 0.92 * rootPatch + sideCol[i] * (0.84 + n1 * 0.18) * (1 - rootPatch), 0, 255); });
        colorImage.data[idx + 3] = 255;
        const bump = clamp(70 + n1 * 115 + n2 * 70 + rootPatch * 24, 0, 255);
        bumpImage.data[idx] = bumpImage.data[idx + 1] = bumpImage.data[idx + 2] = bump;
        bumpImage.data[idx + 3] = 255;
      }
    }
    colorCtx.putImageData(colorImage, 0, 0);
    bumpCtx.putImageData(bumpImage, 0, 0);
    const map = new THREE.CanvasTexture(colorCanvas), bumpMap = new THREE.CanvasTexture(bumpCanvas);
    [map, bumpMap].forEach((texture) => { texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.needsUpdate = true; if ('colorSpace' in texture && THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace; else texture.encoding = THREE.sRGBEncoding; });
    const pathMap = loadTexture(ASSETS.path, { repeat: [1.15, 2.6] });
    OC.groundMaterial = new THREE.MeshStandardMaterial({ map, bumpMap, displacementMap: bumpMap, bumpScale: OC.bumpStrength, displacementScale: OC.displacementStrength, roughness: 0.98, metalness: 0 });
    OC.pathMaterial = new THREE.MeshStandardMaterial({ map: pathMap, roughness: 0.96, metalness: 0, color: 0xffffff });
    OC.featherInnerMaterial = new THREE.MeshStandardMaterial({ map: pathMap, roughness: 0.98, metalness: 0, transparent: true, opacity: 0.30, depthWrite: false, color: 0xffffff });
    OC.featherOuterMaterial = new THREE.MeshStandardMaterial({ map: pathMap, roughness: 1, metalness: 0, transparent: true, opacity: 0.14, depthWrite: false, color: 0xffffff });
    updateGroundRelief();
    if (OC.active) regenerateCourse();
  } catch (error) {
    console.warn('[HorseForest] Ground texture generation failed.', error);
  }
}

function updateGroundRelief() {
  if (OC.groundMaterial) { OC.groundMaterial.bumpScale = OC.bumpStrength; OC.groundMaterial.displacementScale = OC.displacementStrength; OC.groundMaterial.needsUpdate = true; }
  drawFrame();
}

async function loadTreeModels() {
  if (OC.treeLoadStarted) return;
  OC.treeLoadStarted = true;
  try {
    if (!OC.gltfLoaderPromise) OC.gltfLoaderPromise = import('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js');
    const { GLTFLoader } = await OC.gltfLoaderPromise;
    const loader = new GLTFLoader();
    ASSETS.trees.forEach((url) => {
      loader.load(`${url}?v=24`, (gltf) => {
        if (!gltf.scene) return;
        gltf.scene.traverse((node) => { if (node.isMesh) { node.castShadow = false; node.receiveShadow = true; } });
        OC.treeModels.push(gltf.scene);
        if (OC.active) regenerateCourse();
      }, undefined, (error) => console.warn('[HorseForest] GLB tree failed:', url, error));
    });
  } catch (error) {
    console.warn('[HorseForest] GLB tree loader failed. No fake cone trees will be shown.', error);
  }
}

function regenerateCourse() {
  if (!OC.world) return;
  clearWorld();
  const template = TEMPLATES[OC.templateId] || TEMPLATES.horse_forest_easy;
  OC.courseLength = Math.max(900, OC.duration * OC.speed);
  OC.scene.background = loadTexture(ASSETS.background);
  OC.scene.fog = new THREE.Fog(template.fog, 70, 375);
  OC.renderer?.setClearColor(template.clear, 1);
  resetRun(true);
  buildWorld();
  addObstacles(Math.round((8 + OC.difficulty * 5) * template.obstacleRate));
  addCollectibles(8 + OC.difficulty * 3);
  updateTemplateText();
  updateWorldPositions();
  drawFrame();
}

function disposeGroup(group) {
  while (group?.children?.length) {
    const child = group.children.pop();
    child.traverse?.((node) => { node.geometry?.dispose?.(); if (Array.isArray(node.material)) node.material.forEach((mat) => mat.dispose?.()); else node.material?.dispose?.(); });
  }
}

function clearWorld() { disposeGroup(OC.world); OC.objects = []; OC.scenery = []; }
function updateTemplateText() { const template = TEMPLATES[OC.templateId] || TEMPLATES.horse_forest_easy; oc$('obstacle-title').textContent = template.label; oc$('obstacle-objective').textContent = template.objective; oc$('obstacle-target-score').textContent = String(OC.successScore); }
function buildWorld() { buildGroundChunks(); buildVisiblePath(); buildTreeCorridor(); scatterForestFloorDetail(); }

function buildGroundChunks() {
  const mat = OC.groundMaterial || new THREE.MeshStandardMaterial({ color: 0x27311f, roughness: 1 });
  for (let d = 0; d < OC.courseLength + 300; d += SEGMENT) {
    const center = pathCenterAt(d + SEGMENT / 2);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(46, SEGMENT + 1.2, 36, 10), mat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(center, GROUND_Y, -d - SEGMENT / 2);
    OC.world.add(ground);
  }
}

function addPathPiece(width, material, d, yOffset, lateralOffset = 0, renderOrder = 2) {
  const c0 = pathCenterAt(d), c1 = pathCenterAt(d + SEGMENT), mid = (c0 + c1) / 2;
  const angle = Math.atan2(c1 - c0, SEGMENT);
  const normalX = Math.cos(angle), normalZ = Math.sin(angle);
  const z = -d - SEGMENT / 2;
  const piece = new THREE.Mesh(new THREE.PlaneGeometry(width, SEGMENT + 1.15, 8, 8), material);
  piece.rotation.x = -Math.PI / 2;
  piece.rotation.z = angle;
  piece.position.set(mid + normalX * lateralOffset, GROUND_Y + yOffset, z - normalZ * lateralOffset);
  piece.renderOrder = renderOrder;
  OC.world.add(piece);
}

function buildVisiblePath() {
  const centerMat = OC.pathMaterial || new THREE.MeshStandardMaterial({ color: 0x9a6640, roughness: 1 });
  const innerMat = OC.featherInnerMaterial || centerMat;
  const outerMat = OC.featherOuterMaterial || innerMat;
  const centerWidth = OC.laneWidth * 1.55;
  const innerWidth = OC.laneWidth * 0.56;
  const outerWidth = OC.laneWidth * 0.78;
  for (let d = 0; d < OC.courseLength + 300; d += SEGMENT) {
    addPathPiece(centerWidth, centerMat, d, 0.034, 0, 3);
    [-1, 1].forEach((side) => {
      addPathPiece(innerWidth, innerMat, d, 0.036, side * (centerWidth / 2 + innerWidth / 2), 4);
      addPathPiece(outerWidth, outerMat, d, 0.038, side * (centerWidth / 2 + innerWidth + outerWidth / 2), 5);
    });
  }
}

function buildTreeCorridor() {
  if (!OC.treeModels.length) return;
  const mainStep = OC.templateId === 'horse_forest_dense' ? 18 : 24;
  const outerStep = OC.templateId === 'horse_forest_dense' ? 28 : 34;
  for (let d = 30; d < OC.courseLength + 230; d += mainStep) [-1, 1].forEach((side) => addTreeAt(d + rand(-3, 8), side, rand(8, 15), rand(0.8, 3.2)));
  for (let d = 20; d < OC.courseLength + 280; d += outerStep) [-1, 1].forEach((side) => { addTreeAt(d + rand(0, 12), side, rand(10, 18), rand(4, 9)); addTreeAt(d + rand(8, 20), side, rand(8, 14), rand(9, 15)); });
}

function addTreeAt(distance, side, height, extraOffset) {
  const center = pathCenterAt(distance);
  const x = center + side * (OC.laneWidth * 1.25 + extraOffset + rand(0.3, 1.2));
  const tree = createModelTree(height);
  if (!tree) return;
  tree.position.set(x, GROUND_Y, -distance);
  tree.rotation.y = rand(0, Math.PI * 2);
  OC.world.add(tree);
  OC.scenery.push(tree);
}

function createModelTree(targetHeight) {
  if (!OC.treeModels.length) return null;
  const root = pick(OC.treeModels).clone(true);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  const scale = targetHeight / Math.max(size.y, 0.001);
  root.scale.multiplyScalar(scale);
  root.updateMatrixWorld(true);
  const box2 = new THREE.Box3().setFromObject(root);
  const childOffset = new THREE.Group();
  childOffset.add(root);
  root.position.set(-(box2.min.x + box2.max.x) / 2, -box2.min.y, -(box2.min.z + box2.max.z) / 2);
  return childOffset;
}

function scatterForestFloorDetail() {
  for (let d = 18; d < OC.courseLength + 260; d += rand(8, 14)) {
    [-1, 1].forEach((side) => {
      const center = pathCenterAt(d);
      const x = center + side * (OC.laneWidth * 1.22 + rand(0.7, 7.2));
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
    leaf.position.y = 0.25; leaf.rotation.x = rand(-0.4, 0.15); leaf.rotation.y = (Math.PI * 2 * i) / 6; leaf.rotation.z = rand(-0.18, 0.18); leaf.position.x = Math.sin(leaf.rotation.y) * 0.18; leaf.position.z = Math.cos(leaf.rotation.y) * 0.18; group.add(leaf);
  }
  group.position.set(x, GROUND_Y + 0.02, -distance); group.scale.setScalar(rand(0.65, 1.15)); OC.world.add(group); OC.scenery.push(group);
}

function addSceneryRock(x, distance) { const rock = createRock(); rock.position.set(x, GROUND_Y + 0.18, -distance); rock.scale.multiplyScalar(rand(0.55, 0.95)); OC.world.add(rock); OC.scenery.push(rock); }
function createLog() { const group = new THREE.Group(); const logMat = new THREE.MeshLambertMaterial({ color: 0x5a3519 }); const cutMat = new THREE.MeshLambertMaterial({ color: 0xa16f3e }); const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 3.6, 14), logMat); body.rotation.z = Math.PI / 2; group.add(body); [-1, 1].forEach((side) => { const end = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 14), cutMat); end.rotation.z = Math.PI / 2; end.position.x = side * 1.82; group.add(end); }); return group; }
function createRock() { const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rand(0.45, 0.75), 0), new THREE.MeshLambertMaterial({ color: Math.random() < 0.5 ? 0x62655c : 0x3e443a, flatShading: true })); rock.scale.set(rand(0.8, 1.4), rand(0.45, 0.9), rand(0.75, 1.3)); rock.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI)); return rock; }
function createBranch() { const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.13, 4.4, 8), new THREE.MeshLambertMaterial({ color: 0x4a2b14 })); branch.rotation.z = Math.PI / 2 + rand(-0.12, 0.12); return branch; }
function createStream() { const group = new THREE.Group(); const water = new THREE.Mesh(new THREE.PlaneGeometry(OC.laneWidth * 3.2, 3.4, 1, 1), new THREE.MeshBasicMaterial({ color: 0x376d87, transparent: true, opacity: 0.82, depthWrite: false })); water.rotation.x = -Math.PI / 2; group.add(water); return group; }

function addObstacles(count) {
  for (let i = 0; i < count; i += 1) {
    const d = 70 + Math.random() * (OC.courseLength - 120); const laneRoll = Math.random(); const center = pathCenterAt(d); const x = center + (laneRoll < 0.34 ? 0 : laneRoll < 0.67 ? -OC.laneWidth * 0.55 : OC.laneWidth * 0.55); const kind = pick(['log', 'log', 'rock', 'branch', 'stream']);
    let obj = kind === 'log' ? createLog() : kind === 'rock' ? createRock() : kind === 'stream' ? createStream() : createBranch(); const isBranch = kind === 'branch'; const isStream = kind === 'stream'; obj.position.set(isStream ? center : x, isBranch ? 1.55 : isStream ? GROUND_Y + 0.035 : GROUND_Y + 0.35, -d); obj.userData = { kind: 'obstacle', obstacleType: kind, hit: false, radiusX: isBranch ? 2.2 : isStream ? OC.laneWidth * 1.42 : 0.85, needsJump: !isBranch, needsDuck: isBranch }; OC.world.add(obj); OC.objects.push(obj);
  }
}

function addCollectibles(count) {
  const geo = new THREE.OctahedronGeometry(0.32, 0);
  for (let i = 0; i < count; i += 1) {
    const d = 45 + Math.random() * (OC.courseLength - 90); const laneRoll = Math.random(); const center = pathCenterAt(d); const x = center + (laneRoll < 0.34 ? 0 : laneRoll < 0.67 ? -OC.laneWidth * 0.55 : OC.laneWidth * 0.55); const y = Math.random() < 0.65 ? -0.55 + Math.random() * 1.2 : 1.2 + Math.random() * 1.2; const obj = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xeec45a, transparent: true, opacity: 0.9 })); obj.position.set(x, y, -d); obj.userData = { kind: 'collectible', collected: false, radius: 0.85, baseScale: 1 }; obj.add(new THREE.PointLight(0xeec45a, 0.75, 9)); OC.world.add(obj); OC.objects.push(obj);
  }
}

function resetRun(keepMessage = false) { OC.running = false; OC.complete = false; OC.distance = 0; OC.score = 0; OC.hits = 0; OC.jumps = 0; OC.collected = 0; OC.player = { x: 0, y: 0, vy: 0, grounded: true }; OC.objects.forEach((obj) => { obj.visible = true; obj.userData.hit = false; obj.userData.collected = false; }); updateWorldPositions(); updateStats(); if (!keepMessage && oc$('obstacle-result')) setResult('Ride reset. Start the test when ready.', 'warn'); }
function startRun() { if (OC.complete) resetRun(true); OC.running = true; OC.clock.getDelta(); oc$('obstacle-status').textContent = 'Riding'; setResult('Horse ride running. Stay in the path corridor, jump obstacles, and duck low branches.', 'warn'); if (!OC.frame) OC.frame = requestAnimationFrame(tickRun); }
function pauseRun() { OC.running = false; if (oc$('obstacle-status')) oc$('obstacle-status').textContent = 'Paused'; if (OC.frame) cancelAnimationFrame(OC.frame); OC.frame = null; }
function tickRun() { OC.frame = null; if (!OC.active) return; const dt = Math.min(0.05, OC.clock.getDelta() || 0.016); if (OC.running) { updatePlayer(dt); OC.distance += OC.speed * dt; checkCollisions(); if (OC.distance >= OC.courseLength) finishRun(); updateStats(); } drawFrame(); if (OC.running) OC.frame = requestAnimationFrame(tickRun); }
function jumpHorse() { if (!OC.running || !OC.player.grounded) return; OC.player.vy = 7.8; OC.player.grounded = false; OC.jumps += 1; }
function updatePlayer(dt) { let dx = 0; if (OC.keys.has('arrowleft') || OC.keys.has('a')) dx -= 1; if (OC.keys.has('arrowright') || OC.keys.has('d')) dx += 1; OC.player.x = clamp(OC.player.x + dx * OC.steerSpeed * dt, -OC.laneWidth, OC.laneWidth); OC.player.vy -= 18 * dt; OC.player.y += OC.player.vy * dt; if (OC.player.y <= 0) { OC.player.y = 0; OC.player.vy = 0; OC.player.grounded = true; } updateWorldPositions(); }
function isDucking() { return OC.keys.has('arrowdown') || OC.keys.has('s'); }
function updateWorldPositions() { if (!OC.camera) return; const bob = OC.running ? Math.sin(performance.now() * 0.012) * 0.035 : 0; const duckOffset = isDucking() && OC.player.grounded ? -0.28 : 0; const curve = pathCenterAt(OC.distance); const camX = curve + OC.player.x * 0.42; const lookX = pathCenterAt(OC.distance + 46) + OC.player.x * 0.14; OC.camera.position.set(camX, 1.48 + OC.player.y + bob + duckOffset, 7.8); OC.camera.lookAt(lookX, 0.12 + OC.player.y * 0.25 + duckOffset * 0.25, -44); if (OC.world) OC.world.position.z = OC.distance; }

function checkCollisions() {
  const px = playerWorldX(); const py = 0.6 + OC.player.y;
  OC.objects.forEach((obj) => {
    if (!obj.visible) return; const worldZ = obj.position.z + OC.world.position.z; if (Math.abs(worldZ + 14) > 1.45) return; const dx = Math.abs(obj.position.x - px);
    if (obj.userData.kind === 'obstacle' && !obj.userData.hit) { const jumpCleared = obj.userData.needsJump && OC.player.y > 0.65; const branchCleared = obj.userData.needsDuck && isDucking(); if (dx < obj.userData.radiusX && !jumpCleared && !branchCleared) { obj.userData.hit = true; obj.visible = false; OC.hits += 1; OC.score -= 1; } }
    if (obj.userData.kind === 'collectible' && !obj.userData.collected) { if (dx < obj.userData.radius && Math.abs(obj.position.y - py) < obj.userData.radius + 0.45) { obj.userData.collected = true; obj.visible = false; OC.collected += 1; OC.score += 5; } }
  });
}

function finishRun() { OC.running = false; OC.complete = true; OC.distance = OC.courseLength; updateStats(); drawFrame(); if (OC.score >= OC.successScore) { oc$('obstacle-status').textContent = 'Success'; setResult(`Success event: ${OC.successEventId} · Quest outcome: ${OC.successOutcomeKey}`, 'success'); } else { oc$('obstacle-status').textContent = 'Failure'; setResult(`Failure event: ${OC.failureEventId} · Quest outcome: ${OC.failureOutcomeKey}`, 'failure'); } }
function updateStats() { if (!oc$('obstacle-score')) return; oc$('obstacle-score').textContent = String(OC.score); oc$('obstacle-collected').textContent = String(OC.collected); oc$('obstacle-hits').textContent = String(OC.hits); oc$('obstacle-jumps').textContent = String(OC.jumps); oc$('obstacle-course-summary').textContent = `${Math.round(OC.distance)}m / ${Math.round(OC.courseLength)}m`; }
function setResult(text, state = 'warn') { const target = oc$('obstacle-result'); if (!target) return; target.textContent = text; target.dataset.state = state; }
function drawFrame() { if (!OC.renderer || !OC.scene || !OC.camera) return; const now = performance.now(); OC.objects.forEach((obj) => { if (obj.userData.kind === 'collectible' && obj.visible) { obj.rotation.y = now * 0.002 + obj.position.z; const base = obj.userData.baseScale ?? 1; obj.scale.setScalar(base + Math.sin(now * 0.006 + obj.position.z) * 0.08); } }); OC.renderer.render(OC.scene, OC.camera); }
function showObstaclePanel(panelId) { OC.panels.querySelectorAll('[data-obstacle-panel]').forEach((panel) => { panel.hidden = panel.dataset.obstaclePanel !== panelId; panel.classList.toggle('is-active', panel.dataset.obstaclePanel === panelId); }); document.querySelectorAll('.panel-nav-button').forEach((button) => button.classList.toggle('is-active', button.dataset.panel === panelId)); }
function closeOtherPuzzleWorkflows() { window.__artifexPatternLock?.close?.(); window.__artifexPotionMatch?.close?.(); window.__artifexHorseForestRunner?.close?.(); document.body.classList.remove('is-pattern-lock', 'is-potion-match', 'is-horse-forest'); }
function interceptClicks(event) { const button = event.target.closest("[data-engine='obstacle-course']"); if (!button) return; event.preventDefault(); event.stopImmediatePropagation(); closeOtherPuzzleWorkflows(); document.querySelectorAll('.puzzle-type-option, .engine-button[data-engine]').forEach((candidate) => { candidate.classList.toggle('is-active', candidate.dataset.engine === 'obstacle-course'); candidate.classList.toggle('is-selected', candidate.dataset.engine === 'obstacle-course'); }); document.getElementById('puzzle-launcher-panel')?.setAttribute('hidden', ''); document.getElementById('puzzle-module-brief-page')?.setAttribute('hidden', ''); openObstacleCourseWorkflow(); }
function boot() { document.addEventListener('click', interceptClicks, true); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
window.__artifexObstacleCourse = { open: openObstacleCourseWorkflow, close: closeObstacleCourseWorkflow, getState: () => ({ templateId: OC.templateId, difficulty: OC.difficulty, duration: OC.duration, speed: OC.speed, laneWidth: OC.laneWidth, bumpStrength: OC.bumpStrength, displacementStrength: OC.displacementStrength, score: OC.score, hits: OC.hits, jumps: OC.jumps, collected: OC.collected, assetBase: ASSET_BASE }) };
