// Horse Forest Runner V3
// Obstacle Course replacement runtime for Artifex Puzzle Creator.
// Uses POV Three.js movement plus image assets from assets/obstacle-course/horse-forest/.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

const ASSET_ROOT = './assets/obstacle-course/horse-forest/';
const HFR_ASSETS = {
  sky: 'sky/forest_sky_clouds_1920x1080.png',
  horizon: 'backgrounds/forest_horizon_misty_pines_01_740x493.png',
  ground: 'ground/forest_floor_roots_tile_placeholder_1254.png',
  trees: [
    'trees/tree_pine_placeholder_01.png',
    'trees/tree_broadleaf_01.png',
    'trees/treeline_pine_alpha_625x350.png',
    'trees/treeline_spruce_alpha_2048x1024.png',
  ],
  foreground: ['foreground/foreground_bush_placeholder_01.png'],
  logs: [
    'obstacles/logs/obstacle_log_bark_01.png',
    'obstacles/logs/obstacle_log_branch_01.png',
    'obstacles/logs/obstacle_log_cut_01.png',
  ],
  rocks: [
    'obstacles/rocks/obstacle_rock_flat_01.png',
    'obstacles/rocks/obstacle_rock_medium_01.png',
    'obstacles/rocks/obstacle_rock_tall_01.png',
  ],
  branches: [
    'obstacles/branches/obstacle_low_branch_01.png',
    'branches/branch_overhead_leafy_01.png',
  ],
  collectibles: [
    'collectibles/flowers/collectible_blue_wildflower_01.png',
    'collectibles/flowers/collectible_pink_wildflower_01.png',
    'collectibles/ingredients/collectible_herb_bundle_01.png',
    'collectibles/charms/collectible_forest_charm_01.png',
  ],
};

const HFR = {
  mounted: false,
  active: false,
  running: false,
  complete: false,
  duration: 45,
  speed: 36,
  steerSpeed: 7,
  jumpPower: 8,
  gravity: 18,
  pathWidth: 4.2,
  courseLength: 1500,
  distance: 0,
  score: 0,
  hits: 0,
  jumps: 0,
  collected: 0,
  successScore: 20,
  successEventId: 'horse_forest_success',
  failureEventId: 'horse_forest_failure',
  successOutcomeKey: 'horse_forest_success',
  failureOutcomeKey: 'horse_forest_failure',
  keys: new Set(),
  player: { x: 0, y: 0, vy: 0, onGround: true },
  stage: null,
  panels: null,
  host: null,
  scene: null,
  camera: null,
  renderer: null,
  world: null,
  clock: null,
  frame: null,
  loader: null,
  route: [],
  objects: [],
  materials: new Map(),
};

const h$ = (id) => document.getElementById(id);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const assetUrl = (path) => `${ASSET_ROOT}${path}`;

function injectStyles() {
  if (h$('horse-forest-runtime-styles')) return;
  const style = document.createElement('style');
  style.id = 'horse-forest-runtime-styles';
  style.textContent = `
    .is-horse-forest .right-preview-layout,.is-horse-forest .overview-window{display:none!important}
    .is-horse-forest .left-panel-body>[data-panel-content],.is-horse-forest #puzzle-launcher-panel{display:none!important}
    .is-horse-forest [data-workflow-menu],.is-horse-forest [data-workflow-only]{display:none!important}
    .horse-forest-stage{height:100%;overflow:auto;padding:18px 20px 22px;background:radial-gradient(circle at 35% 0%,rgba(109,165,117,.22),transparent 38%),#06110a;color:var(--cream,#f4ead4)}
    .horse-workspace{display:grid;grid-template-columns:minmax(620px,1fr) 300px;gap:14px;align-items:start}
    .horse-view-card,.horse-side-card{border:1px solid rgba(154,230,164,.24);border-radius:16px;background:rgba(6,18,10,.86);box-shadow:0 12px 34px rgba(0,0,0,.32)}
    .horse-view-card{padding:16px;display:flex;flex-direction:column;gap:12px;min-height:min(720px,calc(100vh - 140px))}
    .horse-header-line{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid rgba(154,230,164,.18);padding-bottom:12px}.horse-header-line h2{font-family:'Cinzel',serif;margin:3px 0 0;font-size:1.36rem}.horse-header-line p{margin:8px 0 0;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.42}
    .horse-status-pill{border:1px solid rgba(238,196,90,.34);border-radius:999px;color:#eec45a;padding:6px 10px;font-size:.68rem;font-weight:900;white-space:nowrap}
    .horse-three-wrap{position:relative;min-height:500px;border:1px solid rgba(154,230,164,.18);border-radius:18px;overflow:hidden;background:#07140d}.horse-three-wrap canvas{display:block;width:100%!important;height:500px!important;cursor:crosshair}
    .horse-hud{position:absolute;left:14px;right:14px;bottom:12px;display:flex;justify-content:space-between;gap:12px;pointer-events:none;color:var(--cream,#f4ead4);font-size:.74rem;text-shadow:0 2px 5px rgba(0,0,0,.88)}
    .horse-reticle{position:absolute;left:50%;top:56%;width:42px;height:14px;margin:-7px 0 0 -21px;border:1px solid rgba(238,196,90,.6);border-radius:50%;box-shadow:0 0 16px rgba(238,196,90,.25);pointer-events:none}.horse-reticle:after{content:'';position:absolute;left:50%;top:-18px;width:1px;height:50px;background:rgba(238,196,90,.65)}
    .horse-help-strip{display:flex;justify-content:space-between;gap:10px;color:var(--muted,#c9bfae);font-size:.72rem;line-height:1.35}.horse-control-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.horse-control-row button{min-height:42px;border:1px solid rgba(124,202,125,.3);border-radius:10px;background:rgba(20,72,37,.62);color:var(--cream,#f4ead4);font-weight:900;cursor:pointer}.horse-control-row button:hover{border-color:rgba(158,230,164,.62)}
    .horse-side-card{padding:16px 14px;display:flex;flex-direction:column;gap:11px}.horse-side-card h3{font-family:'Cinzel',serif;margin:0;font-size:1.03rem}.horse-metric{display:flex;justify-content:space-between;border:1px solid rgba(154,230,164,.2);border-radius:11px;padding:10px;color:var(--muted,#c9bfae);font-size:.76rem}.horse-metric strong{color:var(--cream,#f4ead4)}
    .horse-result{min-height:64px;border:1px solid rgba(154,230,164,.22);border-radius:11px;padding:11px;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.4}.horse-result[data-state='success']{border-color:#69ad70;color:#9ee6a4;background:#214b2b}.horse-result[data-state='failure']{border-color:#cc6d55;color:#f0a088;background:#4a1d1a}.horse-result[data-state='waiting']{border-color:#c9a64a;color:#eec45a;background:#3c2c12}
    .horse-panel-copy{font-size:.73rem;line-height:1.46;color:var(--muted,#c9bfae);margin:0 0 14px}.horse-asset-list{font-size:.7rem;line-height:1.42;color:var(--muted,#c9bfae);border:1px solid rgba(154,230,164,.17);border-radius:11px;padding:10px;background:rgba(20,35,24,.35);max-height:220px;overflow:auto}.horse-asset-list code{color:#9ee6a4;word-break:break-all}.horse-mini-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.horse-mini-grid button{min-height:38px;border:1px solid rgba(124,202,125,.28);border-radius:9px;background:rgba(20,72,37,.58);color:var(--cream,#f4ead4);font-weight:900}
    @media(max-width:1080px){.horse-workspace{grid-template-columns:1fr}.horse-view-card{min-height:600px}.horse-side-card{min-height:220px}}
  `;
  document.head.appendChild(style);
}

function texture(path) {
  const url = assetUrl(path);
  if (HFR.materials.has(url)) return HFR.materials.get(url);
  const tex = HFR.loader.load(url, () => drawFrame(), undefined, () => console.warn('[HorseForest] Missing asset:', url));
  tex.encoding = THREE.sRGBEncoding;
  HFR.materials.set(url, tex);
  return tex;
}

function sprite(path, width, height, options = {}) {
  const mat = new THREE.SpriteMaterial({ map: texture(path), transparent: true, depthWrite: false, alphaTest: 0.04 });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(width, height, 1);
  sp.userData.radius = options.radius ?? Math.max(width, height) * 0.33;
  sp.userData.kind = options.kind || 'scenery';
  sp.userData.jumpable = Boolean(options.jumpable);
  sp.userData.duckable = Boolean(options.duckable);
  sp.userData.collected = false;
  sp.userData.hit = false;
  sp.userData.asset = path;
  return sp;
}

function setupScene() {
  HFR.scene = new THREE.Scene();
  HFR.camera = new THREE.PerspectiveCamera(68, 1, 0.1, 1200);
  HFR.camera.position.set(0, 2.5, 9);
  HFR.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  HFR.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  HFR.host.prepend(HFR.renderer.domElement);
  HFR.clock = new THREE.Clock();
  HFR.loader = new THREE.TextureLoader();
  HFR.scene.add(new THREE.AmbientLight(0xd8ffe0, 0.78));
  const sun = new THREE.DirectionalLight(0xffefd0, 1.15);
  sun.position.set(-8, 14, 12);
  HFR.scene.add(sun);
  HFR.world = new THREE.Group();
  HFR.scene.add(HFR.world);
  window.addEventListener('resize', resizeRenderer);
  resizeRenderer();
}

function buildStage() {
  const rightPanel = document.querySelector('.right-panel');
  const leftBody = document.querySelector('.left-panel-body');
  if (!rightPanel || !leftBody) return false;
  HFR.stage = document.createElement('section');
  HFR.stage.id = 'horse-forest-stage';
  HFR.stage.className = 'horse-forest-stage';
  HFR.stage.hidden = true;
  HFR.stage.innerHTML = `
    <div class="horse-workspace">
      <section class="horse-view-card">
        <div class="horse-header-line"><div><p class="eyebrow">Obstacle Course · Horse Forest Runner V3</p><h2>Horse Forest Ride</h2><p>Ride forward through the forest. Jump logs and rocks, avoid low branches, and collect flowers, herbs and charms from the route.</p></div><span id="horse-status" class="horse-status-pill">Ready</span></div>
        <div id="horse-three-host" class="horse-three-wrap"><div class="horse-reticle"></div><div class="horse-hud"><span>WASD / arrows steer · Space jumps</span><span id="horse-course-summary">0m / 0m</span></div></div>
        <div class="horse-help-strip"><span>First version: POV horse runner using flat PNG billboards in a 3D world.</span><span>Replace PNGs with final art using the same filenames.</span></div>
        <div class="horse-control-row"><button id="horse-start" type="button">Start Test</button><button id="horse-pause" type="button">Pause</button><button id="horse-reset-run" type="button">Reset Run</button></div>
      </section>
      <aside class="horse-side-card"><p class="eyebrow">Ride Result</p><h3>Score</h3><div class="horse-metric"><span>Score</span><strong id="horse-score">0</strong></div><div class="horse-metric"><span>Collected</span><strong id="horse-collected">0</strong></div><div class="horse-metric"><span>Hits</span><strong id="horse-hits">0</strong></div><div class="horse-metric"><span>Jumps</span><strong id="horse-jumps">0</strong></div><div class="horse-metric"><span>Target Score</span><strong id="horse-target-score">20</strong></div><div id="horse-result" class="horse-result" data-state="waiting">Course waiting. Start the test when ready.</div></aside>
    </div>`;
  rightPanel.prepend(HFR.stage);

  HFR.panels = document.createElement('div');
  HFR.panels.id = 'horse-forest-panels';
  HFR.panels.hidden = true;
  HFR.panels.innerHTML = `
    <section class="panel tool-panel horse-panel" data-horse-panel="build">
      <div class="panel-title-row"><div><p class="eyebrow">01 · Construction</p><h2>Horse Forest</h2></div><span class="status-pill is-waiting">V3</span></div>
      <p class="horse-panel-copy">POV horse-riding Obstacle Course. Logs and rocks are jump obstacles; branches are upper hazards; flowers, herbs and charms are collectibles.</p>
      <label class="range-row"><span>Course Duration <output id="horse-duration-out">45s</output></span><input id="horse-duration" type="range" min="20" max="80" step="5" value="45" /></label>
      <label class="range-row"><span>Difficulty <output id="horse-difficulty-out">2</output></span><input id="horse-difficulty" type="range" min="1" max="5" value="2" /></label>
      <button id="horse-regenerate" class="wide-button" type="button">Regenerate Forest Ride</button>
    </section>
    <section class="panel tool-panel horse-panel" data-horse-panel="display" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">02 · Display</p><h2>Scene Assets</h2></div></div>
      <label class="field-block"><span>Sky image</span><input id="horse-sky-path" type="text" value="${HFR_ASSETS.sky}" /></label>
      <label class="field-block"><span>Horizon image</span><input id="horse-horizon-path" type="text" value="${HFR_ASSETS.horizon}" /></label>
      <label class="field-block"><span>Ground tile</span><input id="horse-ground-path" type="text" value="${HFR_ASSETS.ground}" /></label>
      <label class="range-row"><span>Flight / Ride Speed <output id="horse-speed-out">36</output></span><input id="horse-speed" type="range" min="18" max="70" step="2" value="36" /></label>
      <label class="range-row"><span>Route Width <output id="horse-path-width-out">4.2</output></span><input id="horse-path-width" type="range" min="2" max="7" step="0.2" value="4.2" /></label>
    </section>
    <section class="panel tool-panel horse-panel" data-horse-panel="logic" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">03 · Logic</p><h2>Scoring + Events</h2></div></div>
      <p class="horse-panel-copy">Collectible +5. Hit obstacle -1. Finish resolves success/failure by target score. Event IDs are for Quest Builder outcome wiring.</p>
      <label class="range-row"><span>Success Score <output id="horse-success-score-out">20</output></span><input id="horse-success-score" type="range" min="0" max="80" step="5" value="20" /></label>
      <label class="field-block"><span>Success Event ID</span><input id="horse-success-event" type="text" value="horse_forest_success" /></label>
      <label class="field-block"><span>Success Quest Outcome Key</span><input id="horse-success-outcome" type="text" value="horse_forest_success" /></label>
      <label class="field-block"><span>Failure Event ID</span><input id="horse-failure-event" type="text" value="horse_forest_failure" /></label>
      <label class="field-block"><span>Failure Quest Outcome Key</span><input id="horse-failure-outcome" type="text" value="horse_forest_failure" /></label>
    </section>
    <section class="panel tool-panel horse-panel" data-horse-panel="visuals" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">04 · Colors</p><h2>Asset Lists</h2></div></div>
      <div class="horse-asset-list" id="horse-asset-list"></div>
      <div class="horse-mini-grid"><button id="horse-more-obstacles" type="button">More Obstacles</button><button id="horse-more-collectibles" type="button">More Pickups</button></div>
    </section>`;
  leftBody.appendChild(HFR.panels);
  HFR.host = h$('horse-three-host');
  return true;
}

function ensureMounted() {
  if (HFR.mounted) return true;
  injectStyles();
  if (!buildStage()) return false;
  setupScene();
  bindControls();
  HFR.mounted = true;
  return true;
}

function bindControls() {
  h$('horse-duration').addEventListener('input', e => { HFR.duration = Number(e.target.value); h$('horse-duration-out').textContent = `${HFR.duration}s`; regenerateCourse(); });
  h$('horse-difficulty').addEventListener('input', e => { h$('horse-difficulty-out').textContent = e.target.value; regenerateCourse(); });
  h$('horse-speed').addEventListener('input', e => { HFR.speed = Number(e.target.value); h$('horse-speed-out').textContent = String(HFR.speed); regenerateCourse(); });
  h$('horse-path-width').addEventListener('input', e => { HFR.pathWidth = Number(e.target.value); h$('horse-path-width-out').textContent = HFR.pathWidth.toFixed(1); });
  h$('horse-success-score').addEventListener('input', e => { HFR.successScore = Number(e.target.value); h$('horse-success-score-out').textContent = String(HFR.successScore); h$('horse-target-score').textContent = String(HFR.successScore); });
  h$('horse-success-event').addEventListener('input', e => { HFR.successEventId = e.target.value; });
  h$('horse-failure-event').addEventListener('input', e => { HFR.failureEventId = e.target.value; });
  h$('horse-success-outcome').addEventListener('input', e => { HFR.successOutcomeKey = e.target.value; });
  h$('horse-failure-outcome').addEventListener('input', e => { HFR.failureOutcomeKey = e.target.value; });
  h$('horse-regenerate').addEventListener('click', regenerateCourse);
  h$('horse-start').addEventListener('click', startRun);
  h$('horse-pause').addEventListener('click', pauseRun);
  h$('horse-reset-run').addEventListener('click', () => resetRun(false));
  h$('horse-more-obstacles').addEventListener('click', () => { addObstacles(8); drawFrame(); });
  h$('horse-more-collectibles').addEventListener('click', () => { addCollectibles(8); drawFrame(); });

  document.querySelector('.left-icon-bar')?.addEventListener('click', (event) => {
    if (!HFR.active) return;
    const button = event.target.closest('.panel-nav-button');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showHorsePanel(button.dataset.panel);
  }, true);

  window.addEventListener('keydown', (event) => {
    if (!HFR.active) return;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D',' '].includes(event.key)) {
      event.preventDefault();
      HFR.keys.add(event.key.toLowerCase());
      if (event.key === ' ') jump();
    }
  });
  window.addEventListener('keyup', (event) => HFR.keys.delete(event.key.toLowerCase()));
}

function resizeRenderer() {
  if (!HFR.renderer || !HFR.host || !HFR.camera) return;
  const width = Math.max(1, HFR.host.clientWidth);
  const height = 500;
  HFR.camera.aspect = width / height;
  HFR.camera.updateProjectionMatrix();
  HFR.renderer.setSize(width, height);
}

function openHorseForestWorkflow() {
  if (!ensureMounted()) return;
  HFR.active = true;
  document.body.classList.add('is-horse-forest');
  document.body.classList.remove('is-obstacle-course','is-puzzle-brief','is-puzzle-chooser','is-pattern-lock','is-potion-match');
  document.getElementById('puzzle-launcher-panel')?.setAttribute('hidden','');
  document.getElementById('puzzle-module-brief-page')?.setAttribute('hidden','');
  window.__artifexPatternLock?.close?.();
  window.__artifexPotionMatch?.close?.();
  HFR.stage.hidden = false;
  HFR.panels.hidden = false;
  showHorsePanel('build');
  regenerateCourse();
}

function closeHorseForestWorkflow() {
  if (!HFR.mounted) return;
  HFR.active = false;
  pauseRun();
  document.body.classList.remove('is-horse-forest');
  HFR.stage.hidden = true;
  HFR.panels.hidden = true;
}

function regenerateCourse() {
  if (!HFR.world) return;
  while (HFR.world.children.length) HFR.world.remove(HFR.world.children[0]);
  HFR.objects = [];
  HFR.route = [];
  HFR.courseLength = Math.max(800, HFR.duration * HFR.speed);
  buildRoute();
  buildEnvironment();
  const difficulty = Number(h$('horse-difficulty')?.value || 2);
  addScenery(120 + difficulty * 25);
  addObstacles(12 + difficulty * 7);
  addCollectibles(10 + difficulty * 5);
  resetRun(true);
  updateAssetList();
  drawFrame();
}

function buildRoute() {
  const steps = 70;
  const seed = Math.random() * Math.PI * 2;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    HFR.route.push({
      z: -t * HFR.courseLength,
      x: Math.sin(t * 15 + seed) * 2.1 + Math.sin(t * 5.2 + seed) * 1.1,
      y: 0,
    });
  }
}

function routeAt(distance) {
  const z = -distance;
  for (let i = 1; i < HFR.route.length; i += 1) {
    const a = HFR.route[i - 1];
    const b = HFR.route[i];
    if (z >= b.z) {
      const t = (a.z - z) / ((a.z - b.z) || 1);
      return { x: a.x + (b.x - a.x) * t, z };
    }
  }
  return HFR.route[HFR.route.length - 1] || { x: 0, z };
}

function buildEnvironment() {
  const skyPath = h$('horse-sky-path')?.value || HFR_ASSETS.sky;
  const horizonPath = h$('horse-horizon-path')?.value || HFR_ASSETS.horizon;
  const groundPath = h$('horse-ground-path')?.value || HFR_ASSETS.ground;

  const skyTex = texture(skyPath);
  HFR.scene.background = skyTex;
  HFR.scene.fog = new THREE.Fog(0x92b9c7, 70, 360);

  const groundTex = texture(groundPath);
  groundTex.wrapS = THREE.RepeatWrapping;
  groundTex.wrapT = THREE.RepeatWrapping;
  groundTex.repeat.set(18, 80);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, HFR.courseLength + 300, 8, 80), new THREE.MeshBasicMaterial({ map: groundTex }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -1.65, -HFR.courseLength / 2);
  HFR.world.add(ground);

  for (let i = 0; i < 7; i += 1) {
    const h = sprite(horizonPath, 95, 42, { kind: 'horizon' });
    h.position.set((i - 3) * 62, 17, -HFR.courseLength * 0.45 - 170);
    HFR.world.add(h);
  }
}

function randomFrom(list) { return list[Math.floor(Math.random() * list.length)]; }

function addScenery(count) {
  for (let i = 0; i < count; i += 1) {
    const d = Math.random() * HFR.courseLength;
    const side = Math.random() < 0.5 ? -1 : 1;
    const lane = side * (7 + Math.random() * 24);
    const treeAsset = Math.random() < 0.18 ? randomFrom(HFR_ASSETS.foreground) : randomFrom(HFR_ASSETS.trees);
    const scale = treeAsset.includes('treeline') ? 18 + Math.random() * 18 : 7 + Math.random() * 9;
    const item = sprite(treeAsset, scale, scale * (treeAsset.includes('treeline') ? 0.55 : 1.35), { kind: 'scenery' });
    item.position.set(lane, treeAsset.includes('foreground') ? 0.6 : 4.5, -d);
    HFR.world.add(item);
  }
}

function addObstacles(count) {
  for (let i = 0; i < count; i += 1) {
    const d = 80 + Math.random() * (HFR.courseLength - 120);
    const p = routeAt(d);
    const typeRoll = Math.random();
    let asset, obj, width, height, y, x;
    if (typeRoll < 0.55) {
      asset = randomFrom(HFR_ASSETS.logs.concat(HFR_ASSETS.rocks));
      width = asset.includes('log') ? 5.2 : 3.2;
      height = asset.includes('log') ? 2.0 : 2.8;
      y = -0.35;
      x = p.x + (Math.random() - 0.5) * HFR.pathWidth;
      obj = sprite(asset, width, height, { kind: 'obstacle', jumpable: true, radius: 1.55 });
    } else {
      asset = randomFrom(HFR_ASSETS.branches);
      width = 7.8;
      height = 2.8;
      y = 3.6;
      x = p.x + (Math.random() - 0.5) * HFR.pathWidth;
      obj = sprite(asset, width, height, { kind: 'obstacle', duckable: true, radius: 1.55 });
    }
    obj.position.set(x, y, -d);
    HFR.world.add(obj);
    HFR.objects.push(obj);
  }
}

function addCollectibles(count) {
  for (let i = 0; i < count; i += 1) {
    const d = 65 + Math.random() * (HFR.courseLength - 100);
    const p = routeAt(d);
    const asset = randomFrom(HFR_ASSETS.collectibles);
    const item = sprite(asset, 1.75, 1.75, { kind: 'collectible', radius: 1.1 });
    item.position.set(p.x + (Math.random() - 0.5) * HFR.pathWidth * 1.25, Math.random() < 0.35 ? 2.8 : 0.75, -d);
    HFR.world.add(item);
    HFR.objects.push(item);
    const glow = new THREE.PointLight(0xeec45a, 0.45, 9);
    item.add(glow);
  }
}

function resetRun(quiet = false) {
  HFR.running = false;
  HFR.complete = false;
  HFR.distance = 0;
  HFR.score = 0;
  HFR.hits = 0;
  HFR.jumps = 0;
  HFR.collected = 0;
  HFR.player.x = 0;
  HFR.player.y = 0;
  HFR.player.vy = 0;
  HFR.player.onGround = true;
  HFR.objects.forEach(o => { o.visible = true; o.userData.hit = false; o.userData.collected = false; });
  updateCamera();
  updateStats();
  if (!quiet) setResult('Course reset. Start the test when ready.', 'waiting');
}

function startRun() {
  if (HFR.complete) resetRun(true);
  HFR.running = true;
  HFR.clock.getDelta();
  h$('horse-status').textContent = 'Riding';
  setResult('Horse ride running. Steer through the route and jump the ground obstacles.', 'waiting');
  if (!HFR.frame) HFR.frame = requestAnimationFrame(tick);
}

function pauseRun() {
  HFR.running = false;
  if (h$('horse-status')) h$('horse-status').textContent = 'Paused';
  if (HFR.frame) cancelAnimationFrame(HFR.frame);
  HFR.frame = null;
}

function jump() {
  if (!HFR.running || !HFR.player.onGround) return;
  HFR.player.vy = HFR.jumpPower;
  HFR.player.onGround = false;
  HFR.jumps += 1;
}

function tick() {
  HFR.frame = null;
  if (!HFR.active) return;
  const dt = Math.min(0.05, HFR.clock.getDelta() || 0.016);
  if (HFR.running) {
    updatePlayer(dt);
    HFR.distance += HFR.speed * dt;
    checkCollisions();
    if (HFR.distance >= HFR.courseLength) finishRun();
    updateStats();
  }
  drawFrame();
  if (HFR.running) HFR.frame = requestAnimationFrame(tick);
}

function updatePlayer(dt) {
  let dx = 0;
  if (HFR.keys.has('arrowleft') || HFR.keys.has('a')) dx -= 1;
  if (HFR.keys.has('arrowright') || HFR.keys.has('d')) dx += 1;
  if (HFR.keys.has('arrowup') || HFR.keys.has('w')) HFR.speed = clamp(HFR.speed + dt * 4, 18, 70);
  if (HFR.keys.has('arrowdown') || HFR.keys.has('s')) HFR.speed = clamp(HFR.speed - dt * 5, 18, 70);
  HFR.player.x = clamp(HFR.player.x + dx * HFR.steerSpeed * dt, -7.2, 7.2);
  HFR.player.vy -= HFR.gravity * dt;
  HFR.player.y += HFR.player.vy * dt;
  if (HFR.player.y <= 0) {
    HFR.player.y = 0;
    HFR.player.vy = 0;
    HFR.player.onGround = true;
  }
  updateCamera();
}

function updateCamera() {
  const guide = routeAt(HFR.distance + 26);
  HFR.camera.position.set(HFR.player.x, 2.3 + HFR.player.y, 9);
  HFR.camera.lookAt(guide.x + HFR.player.x * 0.25, 1.7 + HFR.player.y * 0.25, -38);
  if (HFR.world) HFR.world.position.z = HFR.distance;
}

function checkCollisions() {
  const player = new THREE.Vector3(HFR.player.x, 0.6 + HFR.player.y, -HFR.distance - 18);
  HFR.objects.forEach((obj) => {
    if (!obj.visible) return;
    const worldPos = obj.getWorldPosition(new THREE.Vector3());
    const dist = worldPos.distanceTo(player);
    if (obj.userData.kind === 'collectible' && !obj.userData.collected && dist < obj.userData.radius + 0.8) {
      obj.userData.collected = true;
      obj.visible = false;
      HFR.collected += 1;
      HFR.score += 5;
    }
    if (obj.userData.kind === 'obstacle' && !obj.userData.hit && dist < obj.userData.radius + 0.9) {
      const jumped = obj.userData.jumpable && HFR.player.y > 1.15;
      const ducked = obj.userData.duckable && HFR.player.y < 0.35;
      if (!jumped && !ducked) {
        obj.userData.hit = true;
        obj.visible = false;
        HFR.hits += 1;
        HFR.score -= 1;
      }
    }
  });
}

function finishRun() {
  HFR.running = false;
  HFR.complete = true;
  HFR.distance = HFR.courseLength;
  updateStats();
  if (HFR.score >= HFR.successScore) {
    h$('horse-status').textContent = 'Success';
    setResult(`Success event: ${HFR.successEventId} · Quest outcome: ${HFR.successOutcomeKey}`, 'success');
  } else {
    h$('horse-status').textContent = 'Failure';
    setResult(`Failure event: ${HFR.failureEventId} · Quest outcome: ${HFR.failureOutcomeKey}`, 'failure');
  }
}

function updateStats() {
  if (!h$('horse-score')) return;
  h$('horse-score').textContent = String(HFR.score);
  h$('horse-collected').textContent = String(HFR.collected);
  h$('horse-hits').textContent = String(HFR.hits);
  h$('horse-jumps').textContent = String(HFR.jumps);
  h$('horse-target-score').textContent = String(HFR.successScore);
  h$('horse-course-summary').textContent = `${Math.round(HFR.distance)}m / ${Math.round(HFR.courseLength)}m`;
}

function setResult(text, state) {
  const el = h$('horse-result');
  if (!el) return;
  el.textContent = text;
  el.dataset.state = state;
}

function drawFrame() {
  if (!HFR.renderer || !HFR.scene || !HFR.camera) return;
  HFR.objects.forEach((obj) => {
    if (obj.userData.kind === 'collectible') {
      obj.material.rotation += 0.012;
      const s = 1 + Math.sin(performance.now() * 0.006 + obj.position.z) * 0.08;
      obj.scale.setScalar(s * (obj.userData.asset?.includes('charm') ? 2.0 : 1.55));
    }
  });
  HFR.renderer.render(HFR.scene, HFR.camera);
}

function showHorsePanel(panelId) {
  HFR.panels.querySelectorAll('[data-horse-panel]').forEach(panel => {
    panel.hidden = panel.dataset.horsePanel !== panelId;
    panel.classList.toggle('is-active', panel.dataset.horsePanel === panelId);
  });
  document.querySelectorAll('.panel-nav-button').forEach(button => button.classList.toggle('is-active', button.dataset.panel === panelId));
}

function updateAssetList() {
  const el = h$('horse-asset-list');
  if (!el) return;
  const rows = [
    ['Sky', HFR_ASSETS.sky], ['Horizon', HFR_ASSETS.horizon], ['Ground', HFR_ASSETS.ground],
    ['Trees', HFR_ASSETS.trees.join('<br>')], ['Logs', HFR_ASSETS.logs.join('<br>')],
    ['Rocks', HFR_ASSETS.rocks.join('<br>')], ['Branches', HFR_ASSETS.branches.join('<br>')],
    ['Collectibles', HFR_ASSETS.collectibles.join('<br>')], ['Foreground', HFR_ASSETS.foreground.join('<br>')],
  ];
  el.innerHTML = rows.map(([label, value]) => `<strong>${label}</strong><br><code>${value}</code>`).join('<hr>');
}

function interceptClicks(event) {
  const button = event.target.closest("[data-engine='obstacle-course']");
  if (!button) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  document.querySelectorAll('.puzzle-type-option, .engine-button[data-engine]').forEach(candidate => {
    candidate.classList.toggle('is-active', candidate.dataset.engine === 'obstacle-course');
    candidate.classList.toggle('is-selected', candidate.dataset.engine === 'obstacle-course');
  });
  openHorseForestWorkflow();
}

function boot() {
  document.addEventListener('click', interceptClicks, true);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();

window.__artifexHorseForestRunner = {
  open: openHorseForestWorkflow,
  close: closeHorseForestWorkflow,
  getState: () => ({
    duration: HFR.duration,
    speed: HFR.speed,
    pathWidth: HFR.pathWidth,
    successScore: HFR.successScore,
    successEventId: HFR.successEventId,
    failureEventId: HFR.failureEventId,
    successOutcomeKey: HFR.successOutcomeKey,
    failureOutcomeKey: HFR.failureOutcomeKey,
    score: HFR.score,
    hits: HFR.hits,
    jumps: HFR.jumps,
    collected: HFR.collected,
    assetRoot: ASSET_ROOT,
  }),
};
