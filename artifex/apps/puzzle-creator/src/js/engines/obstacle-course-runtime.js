// Obstacle Course / Horse Forest Runner V3
// POV 3D horse-riding obstacle course for Artifex Puzzle Creator.
// Uses asset PNGs when present; falls back to generated Three.js shapes if an asset is missing.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

const ASSET_BASE = './assets/obstacle-course/horse-forest/';

const HORSE_FOREST_ASSETS = {
  sky: `${ASSET_BASE}sky/forest_sky_clouds_1920x1080.png`,
  horizon: `${ASSET_BASE}backgrounds/forest_horizon_misty_pines_01_740x493.png`,
  ground: `${ASSET_BASE}ground/forest_floor_roots_tile_placeholder_1254.png`,
  trees: [
    `${ASSET_BASE}trees/tree_pine_placeholder_01.png`,
    `${ASSET_BASE}trees/tree_broadleaf_01.png`,
    `${ASSET_BASE}trees/treeline_spruce_alpha_2048x1024.png`,
    `${ASSET_BASE}trees/tree_bush_placeholder_01.png`,
  ],
  scenery: [
    `${ASSET_BASE}trees/tree_bush_placeholder_01.png`,
    `${ASSET_BASE}trees/treeline_pine_alpha_625x350.png`,
  ],
  logs: [
    `${ASSET_BASE}obstacles/logs/obstacle_log_cut_01.png`,
    `${ASSET_BASE}obstacles/logs/obstacle_log_branch_01.png`,
    `${ASSET_BASE}obstacles/logs/obstacle_log_bark_01.png`,
    `${ASSET_BASE}obstacles/logs/obstacle_fallen_branch_placeholder_01.png`,
  ],
  rocks: [
    `${ASSET_BASE}obstacles/rocks/obstacle_rock_tall_01.png`,
    `${ASSET_BASE}obstacles/rocks/obstacle_rock_medium_01.png`,
    `${ASSET_BASE}obstacles/rocks/obstacle_rock_flat_01.png`,
  ],
  stumps: [
    `${ASSET_BASE}obstacles/stumps/obstacle_stump_tall_01.png`,
    `${ASSET_BASE}obstacles/stumps/obstacle_stump_low_01.png`,
  ],
  branches: [
    `${ASSET_BASE}obstacles/branches/obstacle_overhead_branch_placeholder_01.png`,
  ],
  collectibles: [
    `${ASSET_BASE}collectibles/flowers/collectible_blue_flower_placeholder_01.png`,
    `${ASSET_BASE}collectibles/flowers/collectible_pink_flower_placeholder_01.png`,
    `${ASSET_BASE}collectibles/ingredients/collectible_herb_bundle_placeholder_01.png`,
    `${ASSET_BASE}collectibles/charms/collectible_forest_charm_placeholder_01.png`,
  ],
};

const OC_TEMPLATES = {
  horse_forest_easy: {
    label: 'Horse Forest Ride',
    objective: 'Ride through the forest path. Jump logs and rocks, avoid low branches, and collect flowers or ingredients.',
    fog: 0x102018,
    ground: 0x25351f,
    sky: 0x9bc9f1,
    obstacleRate: 1,
  },
  horse_forest_dense: {
    label: 'Dense Forest Ride',
    objective: 'Ride through denser forest. More side trees, more logs, and branch pickups placed closer to the path.',
    fog: 0x07130d,
    ground: 0x1b2c19,
    sky: 0x6fa5c8,
    obstacleRate: 1.35,
  },
  horse_forest_night: {
    label: 'Moonlit Forest Ride',
    objective: 'A darker horse ride using the same asset slots. Collect glowing charms and avoid shadowed obstacles.',
    fog: 0x060914,
    ground: 0x11190f,
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
  successEventId: 'obstacle_course_success',
  failureEventId: 'obstacle_course_failure',
  successOutcomeKey: 'horse_forest_success',
  failureOutcomeKey: 'horse_forest_failure',
  keys: new Set(),
  player: { x: 0, y: 0, vy: 0, grounded: true },
  objects: [],
  scenery: [],
  stage: null,
  panels: null,
  host: null,
  scene: null,
  camera: null,
  renderer: null,
  world: null,
  horseOverlay: null,
  clock: null,
  frame: null,
  textureLoader: null,
  textureCache: new Map(),
};

const oc$ = (id) => document.getElementById(id);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function injectObstacleStyles() {
  if (oc$('obstacle-course-pov-styles')) return;
  const style = document.createElement('style');
  style.id = 'obstacle-course-pov-styles';
  style.textContent = `
    .is-obstacle-course .right-preview-layout,.is-obstacle-course .overview-window{display:none!important}
    .is-obstacle-course .left-panel-body>[data-panel-content],.is-obstacle-course #puzzle-launcher-panel{display:none!important}
    .is-obstacle-course [data-workflow-menu],.is-obstacle-course [data-workflow-only]{display:none!important}
    .obstacle-course-stage{height:100%;overflow:auto;padding:18px 20px 22px;background:radial-gradient(circle at 38% 0%,rgba(80,120,180,.22),transparent 34%),#05080d;color:var(--cream,#f4ead4)}
    .obstacle-workspace{display:grid;grid-template-columns:minmax(600px,1fr) 292px;gap:14px;align-items:start}
    .obstacle-view-card,.obstacle-side-card{border:1px solid rgba(124,202,210,.24);border-radius:16px;background:rgba(7,14,22,.84);box-shadow:0 12px 34px rgba(0,0,0,.28)}
    .obstacle-view-card{padding:16px;display:flex;flex-direction:column;gap:12px;min-height:min(720px,calc(100vh - 140px))}
    .obstacle-header-line{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid rgba(124,202,210,.18);padding-bottom:12px}
    .obstacle-header-line h2{font-family:'Cinzel',serif;margin:3px 0 0;font-size:1.38rem}.obstacle-header-line p{margin:8px 0 0;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.42}
    .obstacle-status-pill{border:1px solid rgba(238,196,90,.34);border-radius:999px;color:#eec45a;padding:6px 10px;font-size:.68rem;font-weight:900;white-space:nowrap}
    .obstacle-three-wrap{position:relative;min-height:500px;border:1px solid rgba(124,202,210,.18);border-radius:18px;overflow:hidden;background:#07101c}
    .obstacle-three-wrap canvas{display:block;width:100%!important;height:500px!important;cursor:crosshair}
    .obstacle-hud{position:absolute;left:14px;right:14px;bottom:12px;display:flex;justify-content:space-between;gap:12px;pointer-events:none;color:var(--cream,#f4ead4);font-size:.74rem;text-shadow:0 2px 5px rgba(0,0,0,.8)}
    .obstacle-horse-overlay{position:absolute;left:50%;bottom:-8px;width:230px;height:78px;margin-left:-115px;pointer-events:none;filter:drop-shadow(0 5px 6px rgba(0,0,0,.65));opacity:.92}.obstacle-horse-overlay:before,.obstacle-horse-overlay:after{content:'';position:absolute;bottom:34px;width:34px;height:66px;background:linear-gradient(#5b371e,#21140c);border-radius:70% 70% 25% 25%;transform-origin:bottom center}.obstacle-horse-overlay:before{left:65px;transform:rotate(-14deg)}.obstacle-horse-overlay:after{right:65px;transform:rotate(14deg)}.obstacle-horse-overlay i{position:absolute;left:50%;bottom:0;width:160px;height:62px;margin-left:-80px;border-radius:48% 48% 0 0;background:linear-gradient(#4b2c19,#170e09)}
    .obstacle-reticle{position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px 0 0 -17px;border:1px solid rgba(238,196,90,.35);border-radius:50%;box-shadow:0 0 16px rgba(238,196,90,.16);pointer-events:none}.obstacle-reticle:before,.obstacle-reticle:after{content:'';position:absolute;background:rgba(238,196,90,.45)}.obstacle-reticle:before{left:50%;top:-8px;width:1px;height:50px}.obstacle-reticle:after{top:50%;left:-8px;width:50px;height:1px}
    .obstacle-help-strip{display:flex;justify-content:space-between;gap:10px;color:var(--muted,#c9bfae);font-size:.72rem;line-height:1.35}
    .obstacle-control-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.obstacle-control-row button{min-height:42px;border:1px solid rgba(124,202,125,.3);border-radius:10px;background:rgba(20,72,37,.62);color:var(--cream,#f4ead4);font-weight:900;cursor:pointer}.obstacle-control-row button:hover{border-color:rgba(158,230,164,.62)}
    .obstacle-side-card{padding:16px 14px;display:flex;flex-direction:column;gap:11px}.obstacle-side-card h3{font-family:'Cinzel',serif;margin:0;font-size:1.03rem}
    .obstacle-metric{display:flex;justify-content:space-between;border:1px solid rgba(124,202,210,.2);border-radius:11px;padding:10px;color:var(--muted,#c9bfae);font-size:.76rem}.obstacle-metric strong{color:var(--cream,#f4ead4)}
    .obstacle-result{min-height:64px;border:1px solid rgba(124,202,210,.22);border-radius:11px;padding:11px;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.4}.obstacle-result[data-state='success']{border-color:#69ad70;color:#9ee6a4;background:#214b2b}.obstacle-result[data-state='failure']{border-color:#cc6d55;color:#f0a088;background:#4a1d1a}.obstacle-result[data-state='warn']{border-color:#c9a64a;color:#eec45a;background:#3c2c12}
    .obstacle-panel-copy{font-size:.73rem;line-height:1.46;color:var(--muted,#c9bfae);margin:0 0 14px}.obstacle-score-block{padding:12px;margin:0 0 10px;border-radius:11px;background:rgba(20,35,54,.42);border:1px solid rgba(124,202,210,.17)}.obstacle-score-block small{display:block;color:#eec45a;font-size:.63rem;letter-spacing:.13em;text-transform:uppercase;font-weight:800;margin-bottom:7px}.obstacle-score-block p{margin:0;font-size:.77rem;line-height:1.5;color:var(--cream,#f4ead4)}
    .obstacle-mini-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.obstacle-mini-grid button{min-height:38px;border:1px solid rgba(124,202,125,.28);border-radius:9px;background:rgba(20,72,37,.58);color:var(--cream,#f4ead4);font-weight:900}.asset-list-code{font-size:.62rem;line-height:1.45;white-space:pre-wrap;word-break:break-word;color:#c8e6ca;background:rgba(0,0,0,.28);border:1px solid rgba(124,202,125,.18);border-radius:10px;padding:9px}
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
  injectObstacleStyles();
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
        <div class="obstacle-header-line">
          <div><p class="eyebrow">Obstacle Course · Horse Forest Runner V3</p><h2 id="obstacle-title">Horse Forest Ride</h2><p id="obstacle-objective"></p></div>
          <span id="obstacle-status" class="obstacle-status-pill">Ready</span>
        </div>
        <div id="obstacle-three-host" class="obstacle-three-wrap"><div class="obstacle-reticle"></div><div class="obstacle-horse-overlay"><i></i></div><div class="obstacle-hud"><span>A/D or arrows steer · Space / W / Up jumps</span><span id="obstacle-course-summary">0m / 0m</span></div></div>
        <div class="obstacle-help-strip"><span>POV horse ride: trees and forest floor use PNG assets; logs, rocks and stumps are jump/avoid obstacles.</span><span>Collect flowers, herbs and charms.</span></div>
        <div class="obstacle-control-row"><button id="obstacle-start" type="button">Start Test</button><button id="obstacle-pause" type="button">Pause</button><button id="obstacle-reset-run" type="button">Reset Run</button></div>
      </section>
      <aside class="obstacle-side-card">
        <p class="eyebrow">Ride Result</p><h3>Score</h3>
        <div class="obstacle-metric"><span>Score</span><strong id="obstacle-score">0</strong></div>
        <div class="obstacle-metric"><span>Collected</span><strong id="obstacle-collected">0</strong></div>
        <div class="obstacle-metric"><span>Hits</span><strong id="obstacle-hits">0</strong></div>
        <div class="obstacle-metric"><span>Jumps</span><strong id="obstacle-jumps">0</strong></div>
        <div class="obstacle-metric"><span>Target Score</span><strong id="obstacle-target-score">20</strong></div>
        <div id="obstacle-result" class="obstacle-result" aria-live="polite">Ride waiting. Start the test when ready.</div>
      </aside>
    </div>`;
  rightPanel.prepend(OC.stage);

  OC.panels = document.createElement('div');
  OC.panels.id = 'obstacle-course-panels';
  OC.panels.hidden = true;
  OC.panels.innerHTML = `
    <section class="panel tool-panel obstacle-panel" data-obstacle-panel="build">
      <div class="panel-title-row"><div><p class="eyebrow">01 · Construction</p><h2>Horse Ride</h2></div><span class="status-pill is-waiting">V3</span></div>
      <p class="obstacle-panel-copy">POV 3D forest runner. The player rides forward automatically, steers left/right, jumps logs and rocks, avoids branches, and collects items.</p>
      <label class="field-block"><span>Course Template</span><select id="obstacle-template"><option value="horse_forest_easy">Horse Forest Ride</option><option value="horse_forest_dense">Dense Forest Ride</option><option value="horse_forest_night">Moonlit Forest Ride</option></select></label>
      <label class="range-row"><span>Difficulty <output id="obstacle-difficulty-out">2</output></span><input id="obstacle-difficulty" type="range" min="1" max="5" value="2" /></label>
      <label class="range-row"><span>Course Duration <output id="obstacle-duration-out">45s</output></span><input id="obstacle-duration" type="range" min="20" max="80" step="5" value="45" /></label>
      <button id="obstacle-regenerate" class="wide-button" type="button">Regenerate Horse Course</button>
    </section>
    <section class="panel tool-panel obstacle-panel" data-obstacle-panel="display" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">02 · Display</p><h2>Display</h2></div></div>
      <label class="range-row"><span>Horse Speed <output id="obstacle-speed-out">34</output></span><input id="obstacle-speed" type="range" min="18" max="64" step="2" value="34" /></label>
      <label class="range-row"><span>Lane Width <output id="obstacle-lane-width-out">2.7</output></span><input id="obstacle-lane-width" type="range" min="1.8" max="5" step="0.1" value="2.7" /></label>
      <div class="obstacle-score-block"><small>Image slots</small><p>Sky, ground, horizon, trees, logs, rocks, stumps, branches and collectibles are loaded from the horse-forest asset folder.</p></div>
      <div class="asset-list-code">${ASSET_BASE}\nsky/\nbackgrounds/\nground/\ntrees/\nobstacles/logs/\nobstacles/rocks/\nobstacles/stumps/\nobstacles/branches/\ncollectibles/</div>
    </section>
    <section class="panel tool-panel obstacle-panel" data-obstacle-panel="logic" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">03 · Logic</p><h2>Scoring + Events</h2></div></div>
      <div class="obstacle-score-block"><small>Scoring</small><p>Collect flower/herb/charm: +5. Hit log/rock/stump/branch: -1. Jump/avoid obstacles and finish the route to resolve success or failure.</p></div>
      <label class="range-row"><span>Success Score <output id="obstacle-success-score-out">20</output></span><input id="obstacle-success-score" type="range" min="0" max="80" step="5" value="20" /></label>
      <label class="field-block"><span>Success Event ID</span><input id="obstacle-success-event" type="text" value="obstacle_course_success" /></label>
      <label class="field-block"><span>Success Quest Outcome Key</span><input id="obstacle-success-outcome" type="text" value="horse_forest_success" /></label>
      <label class="field-block"><span>Failure Event ID</span><input id="obstacle-failure-event" type="text" value="obstacle_course_failure" /></label>
      <label class="field-block"><span>Failure Quest Outcome Key</span><input id="obstacle-failure-outcome" type="text" value="horse_forest_failure" /></label>
    </section>
    <section class="panel tool-panel obstacle-panel" data-obstacle-panel="visuals" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">04 · Colors</p><h2>Asset Sets</h2></div></div>
      <p class="obstacle-panel-copy">V3 now uses PNG billboard assets where available. Missing images fall back to primitive placeholder geometry, so the module does not crash while assets are being swapped.</p>
      <div class="obstacle-mini-grid"><button id="obstacle-add-obstacles" type="button">More Obstacles</button><button id="obstacle-add-collectibles" type="button">More Collectibles</button></div>
    </section>`;
  leftBody.appendChild(OC.panels);

  OC.host = oc$('obstacle-three-host');
  setupThreeScene();
  bindObstacleControls();
  OC.mounted = true;
}

function setupThreeScene() {
  OC.textureLoader = new THREE.TextureLoader();
  OC.scene = new THREE.Scene();
  OC.camera = new THREE.PerspectiveCamera(70, 1, 0.1, 1000);
  OC.camera.position.set(0, 2.2, 8);
  OC.camera.lookAt(0, 2.0, -40);
  OC.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  OC.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  OC.renderer.shadowMap.enabled = false;
  OC.host.prepend(OC.renderer.domElement);
  OC.clock = new THREE.Clock();

  OC.scene.add(new THREE.AmbientLight(0xd8f0ff, 0.72));
  const sun = new THREE.DirectionalLight(0xfff0d0, 0.95);
  sun.position.set(-8, 16, 12);
  OC.scene.add(sun);

  OC.world = new THREE.Group();
  OC.scene.add(OC.world);
  window.addEventListener('resize', resizeRenderer);
  resizeRenderer();
}

function bindObstacleControls() {
  oc$('obstacle-template').addEventListener('change', (event) => { OC.templateId = event.target.value; regenerateCourse(); });
  oc$('obstacle-difficulty').addEventListener('input', (event) => { OC.difficulty = Number(event.target.value); oc$('obstacle-difficulty-out').textContent = String(OC.difficulty); regenerateCourse(); });
  oc$('obstacle-duration').addEventListener('input', (event) => { OC.duration = Number(event.target.value); oc$('obstacle-duration-out').textContent = `${OC.duration}s`; regenerateCourse(); });
  oc$('obstacle-speed').addEventListener('input', (event) => { OC.speed = Number(event.target.value); oc$('obstacle-speed-out').textContent = String(OC.speed); regenerateCourse(); });
  oc$('obstacle-lane-width').addEventListener('input', (event) => { OC.laneWidth = Number(event.target.value); oc$('obstacle-lane-width-out').textContent = OC.laneWidth.toFixed(1); regenerateCourse(); });
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
  if (OC.textureCache.has(url)) return OC.textureCache.get(url);
  const texture = OC.textureLoader.load(url, undefined, undefined, () => {});
  texture.colorSpace = THREE.SRGBColorSpace || texture.colorSpace;
  if (options.repeat) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(options.repeat[0], options.repeat[1]);
  }
  OC.textureCache.set(url, texture);
  return texture;
}

function makeSprite(url, width, height, fallbackColor = 0xffffff) {
  const texture = loadTexture(url);
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: 0.12, color: 0xffffff });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(width, height, 1);
  sprite.userData.assetUrl = url;
  sprite.userData.fallbackColor = fallbackColor;
  return sprite;
}

function resizeRenderer() {
  if (!OC.renderer || !OC.host || !OC.camera) return;
  const width = Math.max(1, OC.host.clientWidth);
  const height = 500;
  OC.camera.aspect = width / height;
  OC.camera.updateProjectionMatrix();
  OC.renderer.setSize(width, height);
}

function regenerateCourse() {
  if (!OC.world) return;
  clearWorld();
  const template = OC_TEMPLATES[OC.templateId] || OC_TEMPLATES.horse_forest_easy;
  OC.courseLength = Math.max(900, OC.duration * OC.speed);
  OC.scene.background = loadTexture(HORSE_FOREST_ASSETS.sky);
  OC.scene.fog = new THREE.Fog(template.fog, 50, 360);
  resetRun(true);
  buildWorld(template);
  addObstacles(Math.round((8 + OC.difficulty * 5) * template.obstacleRate));
  addCollectibles(8 + OC.difficulty * 3);
  updateTemplateText();
  updateWorldPositions();
  drawFrame();
}

function clearWorld() {
  while (OC.world.children.length) {
    const child = OC.world.children.pop();
    child.traverse?.((node) => {
      node.geometry?.dispose?.();
      if (Array.isArray(node.material)) node.material.forEach((mat) => mat.dispose?.());
      else node.material?.dispose?.();
    });
  }
  OC.objects = [];
  OC.scenery = [];
}

function updateTemplateText() {
  const template = OC_TEMPLATES[OC.templateId] || OC_TEMPLATES.horse_forest_easy;
  oc$('obstacle-title').textContent = template.label;
  oc$('obstacle-objective').textContent = template.objective;
  oc$('obstacle-target-score').textContent = String(OC.successScore);
}

function buildWorld(template) {
  const groundTexture = loadTexture(HORSE_FOREST_ASSETS.ground, { repeat: [8, Math.max(12, OC.courseLength / 80)] });
  const groundMat = new THREE.MeshStandardMaterial({ map: groundTexture, color: 0xffffff, roughness: 0.95, metalness: 0.0 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(28, OC.courseLength + 240, 1, 1), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -1.8, -OC.courseLength / 2);
  OC.world.add(ground);

  const pathMat = new THREE.MeshBasicMaterial({ color: template.ground, transparent: true, opacity: 0.36 });
  const path = new THREE.Mesh(new THREE.PlaneGeometry(OC.laneWidth * 2.35, OC.courseLength + 240, 1, 1), pathMat);
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, -1.78, -OC.courseLength / 2);
  OC.world.add(path);

  for (let d = 80; d < OC.courseLength + 200; d += 180) {
    const horizon = makeSprite(HORSE_FOREST_ASSETS.horizon, 70, 26, 0x25401f);
    horizon.position.set(0, 10.5, -d - 120);
    horizon.material.opacity = 0.64;
    OC.world.add(horizon);
    OC.scenery.push(horizon);
  }

  const count = 95 + OC.difficulty * 22;
  for (let i = 0; i < count; i += 1) {
    const d = Math.random() * OC.courseLength;
    const side = Math.random() < 0.5 ? -1 : 1;
    const x = side * (OC.laneWidth + 3.1 + Math.random() * 9.5);
    const h = 4.8 + Math.random() * 7.5;
    const w = h * (0.55 + Math.random() * 0.55);
    const tree = makeSprite(pick(Math.random() < 0.75 ? HORSE_FOREST_ASSETS.trees : HORSE_FOREST_ASSETS.scenery), w, h, 0x2f6a35);
    tree.position.set(x, -1.6 + h / 2, -d);
    OC.world.add(tree);
    OC.scenery.push(tree);
  }
}

function addObstacles(count) {
  for (let i = 0; i < count; i += 1) {
    const d = 70 + Math.random() * (OC.courseLength - 120);
    const laneRoll = Math.random();
    const x = laneRoll < 0.34 ? 0 : laneRoll < 0.67 ? -OC.laneWidth * 0.55 : OC.laneWidth * 0.55;
    const kind = pick(['log', 'log', 'rock', 'stump', 'branch']);
    let obj;
    if (kind === 'log') obj = makeSprite(pick(HORSE_FOREST_ASSETS.logs), 2.9, 1.05, 0x7b4b2a);
    else if (kind === 'rock') obj = makeSprite(pick(HORSE_FOREST_ASSETS.rocks), 1.55, 1.35, 0x777777);
    else if (kind === 'stump') obj = makeSprite(pick(HORSE_FOREST_ASSETS.stumps), 1.25, 1.65, 0x775533);
    else obj = makeSprite(pick(HORSE_FOREST_ASSETS.branches), 4.2, 1.4, 0x6a4428);
    const isBranch = kind === 'branch';
    obj.position.set(x, isBranch ? 2.45 : -1.05 + obj.scale.y / 2, -d);
    obj.userData = { kind: 'obstacle', obstacleType: kind, hit: false, radiusX: isBranch ? 2.2 : 0.85, radiusZ: 1.15, needsJump: !isBranch, needsDuck: isBranch };
    OC.world.add(obj);
    OC.objects.push(obj);
  }
}

function addCollectibles(count) {
  for (let i = 0; i < count; i += 1) {
    const d = 45 + Math.random() * (OC.courseLength - 90);
    const laneRoll = Math.random();
    const x = laneRoll < 0.34 ? 0 : laneRoll < 0.67 ? -OC.laneWidth * 0.55 : OC.laneWidth * 0.55;
    const y = Math.random() < 0.65 ? 0.2 + Math.random() * 1.2 : 1.8 + Math.random() * 1.3;
    const obj = makeSprite(pick(HORSE_FOREST_ASSETS.collectibles), 0.82, 0.82, 0xeec45a);
    obj.position.set(x, y, -d);
    obj.userData = { kind: 'collectible', collected: false, radius: 0.85 };
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
  });
  updateWorldPositions();
  updateStats();
  if (!keepMessage && oc$('obstacle-result')) setResult('Ride reset. Start the test when ready.', 'waiting');
}

function startRun() {
  if (OC.complete) resetRun(true);
  OC.running = true;
  OC.clock.getDelta();
  oc$('obstacle-status').textContent = 'Riding';
  setResult('Horse ride running. Steer through the path and jump obstacles.', 'waiting');
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

function updateWorldPositions() {
  const bob = OC.running ? Math.sin(performance.now() * 0.012) * 0.035 : 0;
  OC.camera.position.set(OC.player.x, 2.1 + OC.player.y + bob, 8);
  OC.camera.lookAt(OC.player.x * 0.2, 1.45 + OC.player.y * 0.35, -38);
  if (OC.world) OC.world.position.z = OC.distance;
}

function checkCollisions() {
  const playerZ = -OC.distance - 14;
  const playerY = 0.6 + OC.player.y;
  OC.objects.forEach((obj) => {
    if (!obj.visible) return;
    const worldZ = obj.position.z + OC.world.position.z;
    if (Math.abs(worldZ + 14) > 1.45) return;
    const dx = Math.abs(obj.position.x - OC.player.x);
    if (obj.userData.kind === 'obstacle' && !obj.userData.hit) {
      const xHit = dx < obj.userData.radiusX;
      const jumpCleared = obj.userData.needsJump && OC.player.y > 0.65;
      const branchCleared = obj.userData.needsDuck && playerY < 1.9;
      if (xHit && !jumpCleared && !branchCleared) {
        obj.userData.hit = true;
        obj.material.opacity = 0.35;
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

function setResult(text, state = 'waiting') {
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
      obj.material.rotation = Math.sin(now * 0.004 + obj.position.z) * 0.08;
      obj.scale.setScalar(0.82 + Math.sin(now * 0.006 + obj.position.z) * 0.08);
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
  document.body.classList.remove('is-pattern-lock', 'is-potion-match');
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootObstacleCourse, { once: true });
} else {
  bootObstacleCourse();
}

window.__artifexObstacleCourse = {
  open: openObstacleCourseWorkflow,
  close: closeObstacleCourseWorkflow,
  getState: () => ({
    templateId: OC.templateId,
    difficulty: OC.difficulty,
    duration: OC.duration,
    speed: OC.speed,
    laneWidth: OC.laneWidth,
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
