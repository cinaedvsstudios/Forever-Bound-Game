// Horse Forest Runner V4
// Fixes V3 stretched texture bands by rebuilding the POV ride as separate sky,
// horizon, ground, side-forest, obstacle and collectible layers.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

const ASSET_ROOT = './assets/obstacle-course/horse-forest/';
const ASSETS = {
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

const H = {
  mounted: false,
  active: false,
  running: false,
  complete: false,
  duration: 45,
  difficulty: 2,
  speed: 34,
  baseSpeed: 34,
  steerSpeed: 8,
  jumpPower: 9,
  gravity: 20,
  pathWidth: 4.8,
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
  route: [],
  objects: [],
  textures: new Map(),
  stage: null,
  panels: null,
  host: null,
  scene: null,
  camera: null,
  renderer: null,
  loader: null,
  clock: null,
  world: null,
  frame: null,
};

const $ = (id) => document.getElementById(id);
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const assetUrl = (path) => `${ASSET_ROOT}${path}`;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function injectStyles() {
  if ($('horse-forest-runtime-styles')) return;
  const style = document.createElement('style');
  style.id = 'horse-forest-runtime-styles';
  style.textContent = `
    .is-horse-forest .right-preview-layout,.is-horse-forest .overview-window{display:none!important}
    .is-horse-forest .left-panel-body>[data-panel-content],.is-horse-forest #puzzle-launcher-panel{display:none!important}
    .is-horse-forest [data-workflow-menu],.is-horse-forest [data-workflow-only]{display:none!important}
    .horse-forest-stage{height:100%;overflow:auto;padding:18px 20px 22px;background:#06110a;color:var(--cream,#f4ead4)}
    .horse-workspace{display:grid;grid-template-columns:minmax(620px,1fr) 300px;gap:14px;align-items:start}
    .horse-view-card,.horse-side-card{border:1px solid rgba(154,230,164,.24);border-radius:16px;background:rgba(6,18,10,.86);box-shadow:0 12px 34px rgba(0,0,0,.32)}
    .horse-view-card{padding:16px;display:flex;flex-direction:column;gap:12px;min-height:min(720px,calc(100vh - 140px))}
    .horse-header-line{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid rgba(154,230,164,.18);padding-bottom:12px}
    .horse-header-line h2{font-family:'Cinzel',serif;margin:3px 0 0;font-size:1.36rem}
    .horse-header-line p{margin:8px 0 0;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.42}
    .horse-status-pill{border:1px solid rgba(238,196,90,.34);border-radius:999px;color:#eec45a;padding:6px 10px;font-size:.68rem;font-weight:900;white-space:nowrap}
    .horse-three-wrap{position:relative;min-height:500px;border:1px solid rgba(154,230,164,.18);border-radius:18px;overflow:hidden;background:#7fc0ea}
    .horse-three-wrap canvas{display:block;width:100%!important;height:500px!important;cursor:crosshair}
    .horse-reticle{position:absolute;left:50%;top:62%;width:42px;height:14px;margin:-7px 0 0 -21px;border:1px solid rgba(238,196,90,.6);border-radius:50%;box-shadow:0 0 16px rgba(238,196,90,.25);pointer-events:none}
    .horse-reticle:after{content:'';position:absolute;left:50%;top:-18px;width:1px;height:50px;background:rgba(238,196,90,.65)}
    .horse-hud{position:absolute;left:14px;right:14px;bottom:12px;display:flex;justify-content:space-between;gap:12px;pointer-events:none;color:var(--cream,#f4ead4);font-size:.74rem;text-shadow:0 2px 5px rgba(0,0,0,.88)}
    .horse-help-strip{display:flex;justify-content:space-between;gap:10px;color:var(--muted,#c9bfae);font-size:.72rem;line-height:1.35}
    .horse-control-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
    .horse-control-row button,.horse-mini-grid button{min-height:42px;border:1px solid rgba(124,202,125,.3);border-radius:10px;background:rgba(20,72,37,.62);color:var(--cream,#f4ead4);font-weight:900;cursor:pointer}
    .horse-side-card{padding:16px 14px;display:flex;flex-direction:column;gap:11px}
    .horse-side-card h3{font-family:'Cinzel',serif;margin:0;font-size:1.03rem}
    .horse-metric{display:flex;justify-content:space-between;border:1px solid rgba(154,230,164,.2);border-radius:11px;padding:10px;color:var(--muted,#c9bfae);font-size:.76rem}
    .horse-metric strong{color:var(--cream,#f4ead4)}
    .horse-result{min-height:64px;border:1px solid rgba(154,230,164,.22);border-radius:11px;padding:11px;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.4}
    .horse-result[data-state='success']{border-color:#69ad70;color:#9ee6a4;background:#214b2b}
    .horse-result[data-state='failure']{border-color:#cc6d55;color:#f0a088;background:#4a1d1a}
    .horse-result[data-state='waiting']{border-color:#c9a64a;color:#eec45a;background:#3c2c12}
    .horse-panel-copy{font-size:.73rem;line-height:1.46;color:var(--muted,#c9bfae);margin:0 0 14px}
    .horse-asset-list{font-size:.7rem;line-height:1.42;color:var(--muted,#c9bfae);border:1px solid rgba(154,230,164,.17);border-radius:11px;padding:10px;background:rgba(20,35,24,.35);max-height:220px;overflow:auto}
    .horse-asset-list code{color:#9ee6a4;word-break:break-all}
    .horse-mini-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    @media(max-width:1080px){.horse-workspace{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
}

function texture(path, opts = {}) {
  const key = `${assetUrl(path)}:${JSON.stringify(opts)}`;
  if (H.textures.has(key)) return H.textures.get(key);
  const tex = H.loader.load(assetUrl(path), () => drawFrame(), undefined, () => console.warn('[HorseForest] Missing asset:', assetUrl(path)));
  tex.encoding = THREE.sRGBEncoding;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = H.renderer?.capabilities?.getMaxAnisotropy?.() || 1;
  if (opts.repeat) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(opts.repeat[0], opts.repeat[1]);
  } else {
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
  }
  H.textures.set(key, tex);
  return tex;
}

function makeSprite(path, width, height, kind = 'scenery', radius = null) {
  const material = new THREE.SpriteMaterial({
    map: texture(path),
    transparent: true,
    depthWrite: false,
    alphaTest: 0.06,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(width, height, 1);
  sprite.userData = {
    kind,
    asset: path,
    radius: radius ?? Math.max(width, height) * 0.28,
    hit: false,
    collected: false,
    jumpable: false,
    duckable: false,
  };
  return sprite;
}

function buildStage() {
  const right = document.querySelector('.right-panel');
  const left = document.querySelector('.left-panel-body');
  if (!right || !left) return false;

  H.stage = document.createElement('section');
  H.stage.id = 'horse-forest-stage';
  H.stage.className = 'horse-forest-stage';
  H.stage.hidden = true;
  H.stage.innerHTML = `
    <div class="horse-workspace">
      <section class="horse-view-card">
        <div class="horse-header-line">
          <div>
            <p class="eyebrow">Obstacle Course · Horse Forest Runner V4</p>
            <h2>Horse Forest Ride</h2>
            <p>Ride forward through the forest. Jump logs and rocks, avoid low branches, and collect flowers, herbs and charms.</p>
          </div>
          <span id="horse-status" class="horse-status-pill">Ready</span>
        </div>
        <div id="horse-three-host" class="horse-three-wrap">
          <div class="horse-reticle"></div>
          <div class="horse-hud"><span>WASD / arrows steer · Space jumps</span><span id="horse-course-summary">0m / 0m</span></div>
        </div>
        <div class="horse-help-strip">
          <span>V4 fixes sky, horizon, ground and billboard forest placement.</span>
          <span>Replace PNGs using the same filenames.</span>
        </div>
        <div class="horse-control-row">
          <button id="horse-start" type="button">Start Test</button>
          <button id="horse-pause" type="button">Pause</button>
          <button id="horse-reset-run" type="button">Reset Run</button>
        </div>
      </section>
      <aside class="horse-side-card">
        <p class="eyebrow">Ride Result</p>
        <h3>Score</h3>
        <div class="horse-metric"><span>Score</span><strong id="horse-score">0</strong></div>
        <div class="horse-metric"><span>Collected</span><strong id="horse-collected">0</strong></div>
        <div class="horse-metric"><span>Hits</span><strong id="horse-hits">0</strong></div>
        <div class="horse-metric"><span>Jumps</span><strong id="horse-jumps">0</strong></div>
        <div class="horse-metric"><span>Target Score</span><strong id="horse-target-score">20</strong></div>
        <div id="horse-result" class="horse-result" data-state="waiting">Course waiting. Start the test when ready.</div>
      </aside>
    </div>`;
  right.prepend(H.stage);

  H.panels = document.createElement('div');
  H.panels.id = 'horse-forest-panels';
  H.panels.hidden = true;
  H.panels.innerHTML = `
    <section class="panel tool-panel horse-panel" data-horse-panel="build">
      <div class="panel-title-row"><div><p class="eyebrow">01 · Construction</p><h2>Horse Forest</h2></div><span class="status-pill is-waiting">V4</span></div>
      <p class="horse-panel-copy">POV horse-riding Obstacle Course. Logs/rocks are jump obstacles; branches are upper hazards; flowers/herbs/charms are collectibles.</p>
      <label class="range-row"><span>Course Duration <output id="horse-duration-out">45s</output></span><input id="horse-duration" type="range" min="20" max="80" step="5" value="45" /></label>
      <label class="range-row"><span>Difficulty <output id="horse-difficulty-out">2</output></span><input id="horse-difficulty" type="range" min="1" max="5" value="2" /></label>
      <button id="horse-regenerate" class="wide-button" type="button">Regenerate Forest Ride</button>
    </section>
    <section class="panel tool-panel horse-panel" data-horse-panel="display" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">02 · Display</p><h2>Scene Assets</h2></div></div>
      <label class="field-block"><span>Sky image</span><input id="horse-sky-path" type="text" value="${ASSETS.sky}" /></label>
      <label class="field-block"><span>Horizon image</span><input id="horse-horizon-path" type="text" value="${ASSETS.horizon}" /></label>
      <label class="field-block"><span>Ground tile</span><input id="horse-ground-path" type="text" value="${ASSETS.ground}" /></label>
      <button id="horse-rebuild-scene" class="wide-button" type="button">Apply Asset Paths</button>
    </section>
    <section class="panel tool-panel horse-panel" data-horse-panel="logic" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">03 · Logic</p><h2>Scoring + Events</h2></div></div>
      <p class="horse-panel-copy">Collectible +5. Obstacle hit -1. Finish resolves by target score.</p>
      <label class="range-row"><span>Success Score <output id="horse-success-score-out">20</output></span><input id="horse-success-score" type="range" min="0" max="80" step="5" value="20" /></label>
      <label class="field-block"><span>Success Event ID</span><input id="horse-success-event" type="text" value="horse_forest_success" /></label>
      <label class="field-block"><span>Failure Event ID</span><input id="horse-failure-event" type="text" value="horse_forest_failure" /></label>
    </section>
    <section class="panel tool-panel horse-panel" data-horse-panel="visuals" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">04 · Colors</p><h2>Asset List</h2></div></div>
      <div id="horse-asset-list" class="horse-asset-list"></div>
      <div class="horse-mini-grid"><button id="horse-more-obstacles" type="button">More Obstacles</button><button id="horse-more-collectibles" type="button">More Collectibles</button></div>
    </section>`;
  left.appendChild(H.panels);
  return true;
}

function setupThree() {
  H.scene = new THREE.Scene();
  H.camera = new THREE.PerspectiveCamera(64, 1, 0.1, 1400);
  H.camera.position.set(0, 3.4, 11);
  H.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  H.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  H.renderer.outputEncoding = THREE.sRGBEncoding;
  H.host.prepend(H.renderer.domElement);
  H.clock = new THREE.Clock();
  H.loader = new THREE.TextureLoader();

  H.scene.add(new THREE.HemisphereLight(0xe9f7ff, 0x30421f, 1.15));
  const sun = new THREE.DirectionalLight(0xffefd0, 0.85);
  sun.position.set(-12, 20, 14);
  H.scene.add(sun);

  H.world = new THREE.Group();
  H.scene.add(H.world);
  window.addEventListener('resize', resizeRenderer);
  resizeRenderer();
}

function resizeRenderer() {
  if (!H.renderer || !H.host) return;
  const width = Math.max(1, H.host.clientWidth);
  const height = 500;
  H.camera.aspect = width / height;
  H.camera.updateProjectionMatrix();
  H.renderer.setSize(width, height);
  drawFrame();
}

function bindControls() {
  $('horse-duration').addEventListener('input', (event) => {
    H.duration = Number(event.target.value);
    $('horse-duration-out').textContent = `${H.duration}s`;
    regenerate();
  });
  $('horse-difficulty').addEventListener('input', (event) => {
    H.difficulty = Number(event.target.value);
    $('horse-difficulty-out').textContent = String(H.difficulty);
    regenerate();
  });
  $('horse-regenerate').addEventListener('click', regenerate);
  $('horse-rebuild-scene').addEventListener('click', regenerate);
  $('horse-start').addEventListener('click', startRun);
  $('horse-pause').addEventListener('click', pauseRun);
  $('horse-reset-run').addEventListener('click', () => resetRun(false));
  $('horse-more-obstacles').addEventListener('click', () => { addObstacles(8); drawFrame(); });
  $('horse-more-collectibles').addEventListener('click', () => { addCollectibles(6); drawFrame(); });
  $('horse-success-score').addEventListener('input', (event) => {
    H.successScore = Number(event.target.value);
    $('horse-success-score-out').textContent = String(H.successScore);
    updateStats();
  });
  $('horse-success-event').addEventListener('input', (event) => { H.successEventId = event.target.value; });
  $('horse-failure-event').addEventListener('input', (event) => { H.failureEventId = event.target.value; });

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

function ensureMounted() {
  if (H.mounted) return true;
  injectStyles();
  if (!buildStage()) return false;
  H.host = $('horse-three-host');
  setupThree();
  bindControls();
  H.mounted = true;
  return true;
}

export function openHorseForestWorkflow() {
  if (!ensureMounted()) return;
  H.active = true;
  document.body.classList.add('is-horse-forest');
  document.body.classList.remove('is-puzzle-brief', 'is-puzzle-chooser', 'is-obstacle-course');
  $('puzzle-launcher-panel')?.setAttribute('hidden', '');
  $('puzzle-module-brief-page')?.setAttribute('hidden', '');
  H.stage.hidden = false;
  H.panels.hidden = false;
  showPanel('build');
  regenerate();
}

export function closeHorseForestWorkflow() {
  if (!H.mounted) return;
  H.active = false;
  pauseRun();
  document.body.classList.remove('is-horse-forest');
  H.stage.hidden = true;
  H.panels.hidden = true;
}

function clearWorld() {
  H.objects = [];
  while (H.world.children.length) {
    const child = H.world.children.pop();
    child.traverse?.((node) => {
      node.geometry?.dispose?.();
      if (Array.isArray(node.material)) node.material.forEach((mat) => mat.dispose?.());
      else node.material?.dispose?.();
    });
  }
}

function regenerate() {
  if (!H.world) return;
  pauseRun();
  clearWorld();
  H.route = [];
  H.courseLength = Math.max(800, H.duration * H.baseSpeed);
  H.speed = H.baseSpeed;
  buildRoute();
  buildEnvironment();
  addScenery(70 + H.difficulty * 25);
  addObstacles(12 + H.difficulty * 7);
  addCollectibles(10 + H.difficulty * 5);
  resetRun(true);
  updateAssetList();
  setResult('Forest ride regenerated. Start the test when ready.', 'waiting');
  drawFrame();
}

function buildRoute() {
  const seed = Math.random() * Math.PI * 2;
  for (let i = 0; i <= 86; i += 1) {
    const t = i / 86;
    H.route.push({
      z: -t * H.courseLength,
      x: Math.sin(t * 13 + seed) * 2 + Math.sin(t * 4.8 + seed * 0.4) * 1.1,
    });
  }
}

function routeAt(distance) {
  const z = -distance;
  for (let i = 1; i < H.route.length; i += 1) {
    const a = H.route[i - 1];
    const b = H.route[i];
    if (z >= b.z) {
      const t = (a.z - z) / ((a.z - b.z) || 1);
      return { x: a.x + (b.x - a.x) * t, z };
    }
  }
  return H.route[H.route.length - 1] || { x: 0, z };
}

function buildEnvironment() {
  const skyPath = $('horse-sky-path')?.value || ASSETS.sky;
  const horizonPath = $('horse-horizon-path')?.value || ASSETS.horizon;
  const groundPath = $('horse-ground-path')?.value || ASSETS.ground;

  H.scene.background = new THREE.Color(0x78b8e5);
  H.scene.fog = new THREE.Fog(0xa8c7ca, 110, 560);

  const skyPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(560, 315),
    new THREE.MeshBasicMaterial({ map: texture(skyPath), depthTest: false, depthWrite: false }),
  );
  skyPlane.position.set(0, 72, -520);
  skyPlane.renderOrder = -20;
  H.world.add(skyPlane);

  const horizon = makeSprite(horizonPath, 260, 92, 'horizon');
  horizon.material.depthTest = false;
  horizon.position.set(0, 34, -410);
  horizon.renderOrder = -10;
  H.world.add(horizon);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(95, H.courseLength + 700),
    new THREE.MeshLambertMaterial({ map: texture(groundPath, { repeat: [7, 42] }) }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -1.58, -H.courseLength / 2);
  H.world.add(ground);

  const path = new THREE.Mesh(
    new THREE.PlaneGeometry(11, H.courseLength + 700),
    new THREE.MeshBasicMaterial({ color: 0x3e2416, transparent: true, opacity: 0.34, depthWrite: false }),
  );
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, -1.54, -H.courseLength / 2);
  H.world.add(path);
}

function addScenery(count) {
  for (let i = 0; i < count; i += 1) {
    const d = 20 + Math.random() * H.courseLength;
    const side = Math.random() < 0.5 ? -1 : 1;
    const near = Math.random() < 0.55;
    const lane = side * (near ? 8 + Math.random() * 12 : 20 + Math.random() * 24);
    const asset = Math.random() < 0.18 ? pick(ASSETS.foreground) : pick(ASSETS.trees);
    const isTreeline = asset.includes('treeline');
    const scale = isTreeline ? 22 + Math.random() * 18 : 7 + Math.random() * 10;
    const height = isTreeline ? scale * 0.55 : scale * 1.35;
    const item = makeSprite(asset, scale, height, 'scenery');
    item.position.set(lane, isTreeline ? 6.5 : height / 2 - 1.55, -d);
    item.renderOrder = near ? 3 : 0;
    H.world.add(item);
  }
}

function addObstacles(count) {
  for (let i = 0; i < count; i += 1) {
    const d = 80 + Math.random() * (H.courseLength - 120);
    const point = routeAt(d);
    let object;
    if (Math.random() < 0.58) {
      const asset = pick(ASSETS.logs.concat(ASSETS.rocks));
      const isLog = asset.includes('log');
      object = makeSprite(asset, isLog ? 5.6 : 3.6, isLog ? 2.15 : 3.2, 'obstacle', isLog ? 1.65 : 1.5);
      object.userData.jumpable = true;
      object.position.set(point.x + (Math.random() - 0.5) * H.pathWidth, isLog ? -0.35 : 0.1, -d);
    } else {
      const asset = pick(ASSETS.branches);
      object = makeSprite(asset, 8.2, 3, 'obstacle', 1.55);
      object.userData.duckable = true;
      object.position.set(point.x + (Math.random() - 0.5) * H.pathWidth, 3.7, -d);
    }
    H.world.add(object);
    H.objects.push(object);
  }
}

function addCollectibles(count) {
  for (let i = 0; i < count; i += 1) {
    const d = 65 + Math.random() * (H.courseLength - 100);
    const point = routeAt(d);
    const asset = pick(ASSETS.collectibles);
    const size = asset.includes('charm') ? 2 : 1.65;
    const item = makeSprite(asset, size, size, 'collectible', 1.05);
    item.position.set(point.x + (Math.random() - 0.5) * H.pathWidth * 1.3, Math.random() < 0.38 ? 2.55 : 0.62, -d);
    item.add(new THREE.PointLight(0xeec45a, 0.55, 8));
    H.world.add(item);
    H.objects.push(item);
  }
}

function resetRun(quiet = false) {
  H.running = false;
  H.complete = false;
  H.distance = 0;
  H.score = 0;
  H.hits = 0;
  H.jumps = 0;
  H.collected = 0;
  H.player = { x: 0, y: 0, vy: 0, onGround: true };
  H.objects.forEach((obj) => {
    obj.visible = true;
    obj.userData.hit = false;
    obj.userData.collected = false;
  });
  updateCamera();
  updateStats();
  if (!quiet) setResult('Course reset. Start the test when ready.', 'waiting');
  drawFrame();
}

function startRun() {
  if (H.complete) resetRun(true);
  H.running = true;
  H.clock.getDelta();
  $('horse-status').textContent = 'Riding';
  setResult('Horse ride running. Steer through the route and jump ground obstacles.', 'waiting');
  if (!H.frame) H.frame = requestAnimationFrame(tick);
}

function pauseRun() {
  H.running = false;
  if ($('horse-status')) $('horse-status').textContent = 'Paused';
  if (H.frame) cancelAnimationFrame(H.frame);
  H.frame = null;
}

function jump() {
  if (!H.running || !H.player.onGround) return;
  H.player.vy = H.jumpPower;
  H.player.onGround = false;
  H.jumps += 1;
}

function tick() {
  H.frame = null;
  if (!H.active) return;
  const dt = Math.min(0.05, H.clock.getDelta() || 0.016);
  if (H.running) {
    updatePlayer(dt);
    H.distance += H.speed * dt;
    checkCollisions();
    if (H.distance >= H.courseLength) finishRun();
    updateStats();
  }
  drawFrame();
  if (H.running) H.frame = requestAnimationFrame(tick);
}

function updatePlayer(dt) {
  let dx = 0;
  if (H.keys.has('arrowleft') || H.keys.has('a')) dx -= 1;
  if (H.keys.has('arrowright') || H.keys.has('d')) dx += 1;
  if (H.keys.has('arrowup') || H.keys.has('w')) H.speed = clamp(H.speed + dt * 4, 20, 70);
  if (H.keys.has('arrowdown') || H.keys.has('s')) H.speed = clamp(H.speed - dt * 5, 20, 70);
  H.player.x = clamp(H.player.x + dx * H.steerSpeed * dt, -7.2, 7.2);
  H.player.vy -= H.gravity * dt;
  H.player.y += H.player.vy * dt;
  if (H.player.y <= 0) {
    H.player.y = 0;
    H.player.vy = 0;
    H.player.onGround = true;
  }
  updateCamera();
}

function updateCamera() {
  if (!H.camera) return;
  const guide = routeAt(H.distance + 42);
  H.camera.position.set(H.player.x, 3.25 + H.player.y, 11);
  H.camera.lookAt(guide.x + H.player.x * 0.14, 1.08 + H.player.y * 0.18, -60);
  if (H.world) H.world.position.z = H.distance;
}

function checkCollisions() {
  const player = new THREE.Vector3(H.player.x, 0.75 + H.player.y, -H.distance - 16);
  H.objects.forEach((obj) => {
    if (!obj.visible) return;
    const distance = obj.getWorldPosition(new THREE.Vector3()).distanceTo(player);
    if (obj.userData.kind === 'collectible' && !obj.userData.collected && distance < obj.userData.radius + 0.8) {
      obj.userData.collected = true;
      obj.visible = false;
      H.collected += 1;
      H.score += 5;
    }
    if (obj.userData.kind === 'obstacle' && !obj.userData.hit && distance < obj.userData.radius + 0.9) {
      const jumped = obj.userData.jumpable && H.player.y > 1.08;
      const ducked = obj.userData.duckable && H.player.y < 0.35;
      if (!jumped && !ducked) {
        obj.userData.hit = true;
        obj.visible = false;
        H.hits += 1;
        H.score -= 1;
      }
    }
  });
}

function finishRun() {
  H.running = false;
  H.complete = true;
  H.distance = H.courseLength;
  updateStats();
  if (H.score >= H.successScore) {
    $('horse-status').textContent = 'Success';
    setResult(`Success event: ${H.successEventId} · Quest outcome: ${H.successOutcomeKey}`, 'success');
  } else {
    $('horse-status').textContent = 'Failure';
    setResult(`Failure event: ${H.failureEventId} · Quest outcome: ${H.failureOutcomeKey}`, 'failure');
  }
  drawFrame();
}

function updateStats() {
  if (!$('horse-score')) return;
  $('horse-score').textContent = String(H.score);
  $('horse-collected').textContent = String(H.collected);
  $('horse-hits').textContent = String(H.hits);
  $('horse-jumps').textContent = String(H.jumps);
  $('horse-target-score').textContent = String(H.successScore);
  $('horse-course-summary').textContent = `${Math.round(H.distance)}m / ${Math.round(H.courseLength)}m`;
}

function setResult(text, state) {
  const el = $('horse-result');
  if (!el) return;
  el.textContent = text;
  el.dataset.state = state;
}

function drawFrame() {
  if (!H.renderer || !H.scene || !H.camera) return;
  const now = performance.now();
  H.objects.forEach((obj) => {
    if (obj.userData.kind === 'collectible' && obj.visible) {
      obj.material.rotation += 0.012;
      const base = obj.userData.asset?.includes('charm') ? 2 : 1.55;
      const scale = 1 + Math.sin(now * 0.006 + obj.position.z) * 0.08;
      obj.scale.setScalar(base * scale);
    }
  });
  H.renderer.render(H.scene, H.camera);
}

function showPanel(panelId) {
  H.panels.querySelectorAll('[data-horse-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.horsePanel !== panelId;
    panel.classList.toggle('is-active', panel.dataset.horsePanel === panelId);
  });
  document.querySelectorAll('.panel-nav-button').forEach((button) => button.classList.toggle('is-active', button.dataset.panel === panelId));
}

function updateAssetList() {
  const el = $('horse-asset-list');
  if (!el) return;
  const rows = [
    ['Sky', ASSETS.sky],
    ['Horizon', ASSETS.horizon],
    ['Ground', ASSETS.ground],
    ['Trees', ASSETS.trees.join('<br>')],
    ['Logs', ASSETS.logs.join('<br>')],
    ['Rocks', ASSETS.rocks.join('<br>')],
    ['Branches', ASSETS.branches.join('<br>')],
    ['Collectibles', ASSETS.collectibles.join('<br>')],
    ['Foreground', ASSETS.foreground.join('<br>')],
  ];
  el.innerHTML = rows.map(([label, value]) => `<strong>${label}</strong><br><code>${value}</code>`).join('<hr>');
}

function interceptClicks(event) {
  const button = event.target.closest("[data-engine='obstacle-course']");
  if (!button) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  document.querySelectorAll('.puzzle-type-option, .engine-button[data-engine]').forEach((candidate) => {
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
    duration: H.duration,
    speed: H.speed,
    pathWidth: H.pathWidth,
    successScore: H.successScore,
    successEventId: H.successEventId,
    failureEventId: H.failureEventId,
    successOutcomeKey: H.successOutcomeKey,
    failureOutcomeKey: H.failureOutcomeKey,
    score: H.score,
    hits: H.hits,
    jumps: H.jumps,
    collected: H.collected,
    assetRoot: ASSET_ROOT,
  }),
};
