// Obstacle Course / Flying Practice V2
// Integrated runtime for Artifex Puzzle Creator.
// POV Three.js flight prototype based on the recovered Three.js reference direction:
// movement-through-world, route markers, obstacles, collectibles and outcome events.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

const OC_TEMPLATES = {
  forest_lake: {
    label: 'Forest Lake Flight',
    objective: 'Fly forward through the route markers over a lake and forest path. Dodge obstacles and collect light motes.',
    fog: 0x07130d,
    ground: 0x173d26,
    sky: 0x10233a,
    accents: [0x2d6b42, 0x275a7a, 0x6f8f55],
    obstacles: ['branch', 'rock', 'storm'],
  },
  mountain_pass: {
    label: 'Mountain Pass',
    objective: 'Fly through a mountain pass in first-person view. Stay near the glowing path and avoid peaks, rocks and storm clouds.',
    fog: 0x08111f,
    ground: 0x202c3d,
    sky: 0x162440,
    accents: [0x4b5365, 0x27314a, 0x8c8f9c],
    obstacles: ['peak', 'rock', 'storm'],
  },
  ruined_arches: {
    label: 'Ruined Arches',
    objective: 'Fly through broken ritual ruins. Pass the glowing markers, avoid stone arches and gather motes.',
    fog: 0x09070d,
    ground: 0x201a2e,
    sky: 0x22163a,
    accents: [0x54486a, 0x6b5b42, 0x3e5948],
    obstacles: ['arch', 'rock', 'storm'],
  },
};

const OC = {
  mounted: false,
  active: false,
  running: false,
  complete: false,
  templateId: 'forest_lake',
  difficulty: 2,
  duration: 45,
  speed: 38,
  steerSpeed: 8,
  pathWidth: 3.2,
  distance: 0,
  courseLength: 1700,
  score: 0,
  hits: 0,
  pathMisses: 0,
  collected: 0,
  successScore: 20,
  successEventId: 'obstacle_course_success',
  failureEventId: 'obstacle_course_failure',
  successOutcomeKey: 'flying_practice_success',
  failureOutcomeKey: 'flying_practice_failure',
  keys: new Set(),
  player: { x: 0, y: 0 },
  route: [],
  objects: [],
  stage: null,
  panels: null,
  host: null,
  scene: null,
  camera: null,
  renderer: null,
  world: null,
  clock: null,
  frame: null,
  lastPenaltyAt: 0,
};

const oc$ = (id) => document.getElementById(id);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

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
    .obstacle-three-wrap{position:relative;min-height:520px;border:1px solid rgba(124,202,210,.18);border-radius:18px;overflow:hidden;background:#07101c}
    .obstacle-three-wrap canvas{display:block;width:100%!important;height:520px!important;cursor:crosshair}
    .obstacle-hud{position:absolute;left:14px;right:14px;bottom:12px;display:flex;justify-content:space-between;gap:12px;pointer-events:none;color:var(--cream,#f4ead4);font-size:.74rem;text-shadow:0 2px 5px rgba(0,0,0,.8)}
    .obstacle-reticle{position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px 0 0 -17px;border:1px solid rgba(238,196,90,.55);border-radius:50%;box-shadow:0 0 16px rgba(238,196,90,.25);pointer-events:none}.obstacle-reticle:before,.obstacle-reticle:after{content:'';position:absolute;background:rgba(238,196,90,.7)}.obstacle-reticle:before{left:50%;top:-8px;width:1px;height:50px}.obstacle-reticle:after{top:50%;left:-8px;width:50px;height:1px}
    .obstacle-help-strip{display:flex;justify-content:space-between;gap:10px;color:var(--muted,#c9bfae);font-size:.72rem;line-height:1.35}
    .obstacle-control-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.obstacle-control-row button{min-height:42px;border:1px solid rgba(124,202,125,.3);border-radius:10px;background:rgba(20,72,37,.62);color:var(--cream,#f4ead4);font-weight:900;cursor:pointer}.obstacle-control-row button:hover{border-color:rgba(158,230,164,.62)}
    .obstacle-side-card{padding:16px 14px;display:flex;flex-direction:column;gap:11px}.obstacle-side-card h3{font-family:'Cinzel',serif;margin:0;font-size:1.03rem}
    .obstacle-metric{display:flex;justify-content:space-between;border:1px solid rgba(124,202,210,.2);border-radius:11px;padding:10px;color:var(--muted,#c9bfae);font-size:.76rem}.obstacle-metric strong{color:var(--cream,#f4ead4)}
    .obstacle-result{min-height:64px;border:1px solid rgba(124,202,210,.22);border-radius:11px;padding:11px;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.4}.obstacle-result[data-state='success']{border-color:#69ad70;color:#9ee6a4;background:#214b2b}.obstacle-result[data-state='failure']{border-color:#cc6d55;color:#f0a088;background:#4a1d1a}.obstacle-result[data-state='warn']{border-color:#c9a64a;color:#eec45a;background:#3c2c12}
    .obstacle-panel-copy{font-size:.73rem;line-height:1.46;color:var(--muted,#c9bfae);margin:0 0 14px}.obstacle-score-block{padding:12px;margin:0 0 10px;border-radius:11px;background:rgba(20,35,54,.42);border:1px solid rgba(124,202,210,.17)}.obstacle-score-block small{display:block;color:#eec45a;font-size:.63rem;letter-spacing:.13em;text-transform:uppercase;font-weight:800;margin-bottom:7px}.obstacle-score-block p{margin:0;font-size:.77rem;line-height:1.5;color:var(--cream,#f4ead4)}
    .obstacle-mini-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.obstacle-mini-grid button{min-height:38px;border:1px solid rgba(124,202,125,.28);border-radius:9px;background:rgba(20,72,37,.58);color:var(--cream,#f4ead4);font-weight:900}
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
          <div><p class="eyebrow">Obstacle Course · POV 3D Prototype</p><h2 id="obstacle-title">Flying Practice</h2><p id="obstacle-objective"></p></div>
          <span id="obstacle-status" class="obstacle-status-pill">Ready</span>
        </div>
        <div id="obstacle-three-host" class="obstacle-three-wrap"><div class="obstacle-reticle"></div><div class="obstacle-hud"><span>WASD / arrows steer Mel through the world</span><span id="obstacle-course-summary">0m / 0m</span></div></div>
        <div class="obstacle-help-strip"><span>POV flight: stay inside the glowing tunnel/path, dodge 3D obstacles and collect light motes.</span><span>Reference direction: Three.js moving-world / terrain-style course.</span></div>
        <div class="obstacle-control-row"><button id="obstacle-start" type="button">Start Test</button><button id="obstacle-pause" type="button">Pause</button><button id="obstacle-reset-run" type="button">Reset Run</button></div>
      </section>
      <aside class="obstacle-side-card">
        <p class="eyebrow">Flight Result</p><h3>Score</h3>
        <div class="obstacle-metric"><span>Score</span><strong id="obstacle-score">0</strong></div>
        <div class="obstacle-metric"><span>Collected</span><strong id="obstacle-collected">0</strong></div>
        <div class="obstacle-metric"><span>Hits</span><strong id="obstacle-hits">0</strong></div>
        <div class="obstacle-metric"><span>Path Misses</span><strong id="obstacle-path-misses">0</strong></div>
        <div class="obstacle-metric"><span>Target Score</span><strong id="obstacle-target-score">20</strong></div>
        <div id="obstacle-result" class="obstacle-result" aria-live="polite">Course waiting. Start the test when ready.</div>
      </aside>
    </div>`;
  rightPanel.prepend(OC.stage);

  OC.panels = document.createElement('div');
  OC.panels.id = 'obstacle-course-panels';
  OC.panels.hidden = true;
  OC.panels.innerHTML = `
    <section class="panel tool-panel obstacle-panel" data-obstacle-panel="build">
      <div class="panel-title-row"><div><p class="eyebrow">01 · Construction</p><h2>Flying Practice</h2></div><span class="status-pill is-waiting">V2</span></div>
      <p class="obstacle-panel-copy">POV 3D Obstacle Course: moving world, route-marker tunnel, 3D obstacles, collectibles and score rules.</p>
      <label class="field-block"><span>Course Template</span><select id="obstacle-template"><option value="forest_lake">Forest Lake Flight</option><option value="mountain_pass">Mountain Pass</option><option value="ruined_arches">Ruined Arches</option></select></label>
      <label class="range-row"><span>Difficulty <output id="obstacle-difficulty-out">2</output></span><input id="obstacle-difficulty" type="range" min="1" max="5" value="2" /></label>
      <label class="range-row"><span>Course Duration <output id="obstacle-duration-out">45s</output></span><input id="obstacle-duration" type="range" min="20" max="80" step="5" value="45" /></label>
      <button id="obstacle-regenerate" class="wide-button" type="button">Regenerate 3D Course</button>
    </section>
    <section class="panel tool-panel obstacle-panel" data-obstacle-panel="display" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">02 · Display</p><h2>Display</h2></div></div>
      <label class="range-row"><span>Flight Speed <output id="obstacle-speed-out">38</output></span><input id="obstacle-speed" type="range" min="18" max="70" step="2" value="38" /></label>
      <label class="range-row"><span>Guide Tunnel Width <output id="obstacle-path-width-out">3.2</output></span><input id="obstacle-path-width" type="range" min="1.6" max="6" step="0.2" value="3.2" /></label>
      <label class="toggle-row"><span><strong>Show route markers</strong><small>Display the glowing 3D guide path.</small></span><input id="obstacle-show-markers" type="checkbox" checked /></label>
    </section>
    <section class="panel tool-panel obstacle-panel" data-obstacle-panel="logic" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">03 · Logic</p><h2>Scoring + Events</h2></div></div>
      <div class="obstacle-score-block"><small>Scoring</small><p>Follow the glowing route: no penalty. Outside the tunnel: -1. Hit obstacle: -1. Collect glowing mote: +5. Finish course: resolve by target score.</p></div>
      <label class="range-row"><span>Success Score <output id="obstacle-success-score-out">20</output></span><input id="obstacle-success-score" type="range" min="0" max="80" step="5" value="20" /></label>
      <label class="field-block"><span>Success Event ID</span><input id="obstacle-success-event" type="text" value="obstacle_course_success" /></label>
      <label class="field-block"><span>Success Quest Outcome Key</span><input id="obstacle-success-outcome" type="text" value="flying_practice_success" /></label>
      <label class="field-block"><span>Failure Event ID</span><input id="obstacle-failure-event" type="text" value="obstacle_course_failure" /></label>
      <label class="field-block"><span>Failure Quest Outcome Key</span><input id="obstacle-failure-outcome" type="text" value="flying_practice_failure" /></label>
    </section>
    <section class="panel tool-panel obstacle-panel" data-obstacle-panel="visuals" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">04 · Colors</p><h2>3D Course Objects</h2></div></div>
      <p class="obstacle-panel-copy">V2 uses generated 3D course pieces. Later this can bind to Asset Library models/sprites and Effects Library trail/glow effects.</p>
      <div class="obstacle-mini-grid"><button id="obstacle-add-obstacles" type="button">More Obstacles</button><button id="obstacle-add-collectibles" type="button">More Collectibles</button></div>
    </section>`;
  leftBody.appendChild(OC.panels);

  OC.host = oc$('obstacle-three-host');
  setupThreeScene();
  bindObstacleControls();
  OC.mounted = true;
}

function setupThreeScene() {
  OC.scene = new THREE.Scene();
  OC.camera = new THREE.PerspectiveCamera(70, 1, 0.1, 1000);
  OC.camera.position.set(0, 2.2, 8);
  OC.camera.lookAt(0, 1.4, -32);
  OC.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  OC.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  OC.renderer.shadowMap.enabled = true;
  OC.host.prepend(OC.renderer.domElement);
  OC.clock = new THREE.Clock();

  OC.scene.add(new THREE.AmbientLight(0xbfd7ff, 0.55));
  const sun = new THREE.DirectionalLight(0xfff0d0, 0.9);
  sun.position.set(-8, 12, 8);
  OC.scene.add(sun);
  const glow = new THREE.PointLight(0x8ffbf0, 1.2, 80);
  glow.position.set(0, 4, -12);
  OC.scene.add(glow);

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
  oc$('obstacle-path-width').addEventListener('input', (event) => { OC.pathWidth = Number(event.target.value); oc$('obstacle-path-width-out').textContent = String(OC.pathWidth.toFixed(1)); refreshRouteMarkers(); drawFrame(); });
  oc$('obstacle-show-markers').addEventListener('change', () => { refreshRouteMarkers(); drawFrame(); });
  oc$('obstacle-success-score').addEventListener('input', (event) => { OC.successScore = Number(event.target.value); oc$('obstacle-success-score-out').textContent = String(OC.successScore); oc$('obstacle-target-score').textContent = String(OC.successScore); });
  oc$('obstacle-success-event').addEventListener('input', (event) => { OC.successEventId = event.target.value; });
  oc$('obstacle-failure-event').addEventListener('input', (event) => { OC.failureEventId = event.target.value; });
  oc$('obstacle-success-outcome').addEventListener('input', (event) => { OC.successOutcomeKey = event.target.value; });
  oc$('obstacle-failure-outcome').addEventListener('input', (event) => { OC.failureOutcomeKey = event.target.value; });
  oc$('obstacle-regenerate').addEventListener('click', regenerateCourse);
  oc$('obstacle-start').addEventListener('click', startRun);
  oc$('obstacle-pause').addEventListener('click', pauseRun);
  oc$('obstacle-reset-run').addEventListener('click', () => resetRun(false));
  oc$('obstacle-add-obstacles').addEventListener('click', () => { addObstacles(6); drawFrame(); });
  oc$('obstacle-add-collectibles').addEventListener('click', () => { addCollectibles(5); drawFrame(); });

  window.addEventListener('keydown', (event) => {
    if (!OC.active) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(event.key)) {
      event.preventDefault();
      OC.keys.add(event.key.toLowerCase());
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

function resizeRenderer() {
  if (!OC.renderer || !OC.host || !OC.camera) return;
  const width = Math.max(1, OC.host.clientWidth);
  const height = 520;
  OC.camera.aspect = width / height;
  OC.camera.updateProjectionMatrix();
  OC.renderer.setSize(width, height);
}

function regenerateCourse() {
  if (!OC.world) return;
  clearWorld();
  const template = OC_TEMPLATES[OC.templateId] || OC_TEMPLATES.forest_lake;
  OC.courseLength = Math.max(900, OC.duration * OC.speed);
  OC.scene.background = new THREE.Color(template.sky);
  OC.scene.fog = new THREE.Fog(template.fog, 20, 260);
  OC.route = [];
  OC.objects = [];
  resetRun(true);
  generateRoute();
  buildWorld(template);
  addObstacles(10 + OC.difficulty * 6);
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
}

function updateTemplateText() {
  const template = OC_TEMPLATES[OC.templateId] || OC_TEMPLATES.forest_lake;
  oc$('obstacle-title').textContent = template.label;
  oc$('obstacle-objective').textContent = template.objective;
  oc$('obstacle-target-score').textContent = String(OC.successScore);
}

function generateRoute() {
  const steps = 70;
  const ampX = 3.3 + OC.difficulty * 0.32;
  const ampY = 1.3 + OC.difficulty * 0.16;
  const seed = Math.random() * Math.PI * 2;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const z = -t * OC.courseLength;
    const x = Math.sin(t * 18 + seed) * ampX + Math.sin(t * 6.3 + seed * 0.7) * 1.3;
    const y = 1.8 + Math.sin(t * 13 + seed * 0.4) * ampY;
    OC.route.push({ z, x, y });
  }
}

function buildWorld(template) {
  const groundMat = new THREE.MeshStandardMaterial({ color: template.ground, roughness: 0.88, metalness: 0.02 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(70, OC.courseLength + 300, 20, 80), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -2.4, -OC.courseLength / 2);
  OC.world.add(ground);

  for (let i = 0; i < 110; i += 1) {
    const z = -Math.random() * OC.courseLength;
    const side = Math.random() < 0.5 ? -1 : 1;
    const x = side * (12 + Math.random() * 20);
    const scale = 0.8 + Math.random() * 3.2;
    const deco = createSceneryObject(template, scale);
    deco.position.set(x, -2.2 + Math.random() * 0.3, z);
    deco.rotation.y = Math.random() * Math.PI;
    OC.world.add(deco);
  }
  refreshRouteMarkers();
}

function createSceneryObject(template, scale) {
  const group = new THREE.Group();
  if (template.label.includes('Mountain')) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(scale * 1.7, scale * 4.4, 5), new THREE.MeshStandardMaterial({ color: template.accents[0], roughness: 0.86 }));
    cone.position.y = scale * 1.5;
    group.add(cone);
    return group;
  }
  if (template.label.includes('Ruined')) {
    const mat = new THREE.MeshStandardMaterial({ color: template.accents[1], roughness: 0.8 });
    const a = new THREE.Mesh(new THREE.BoxGeometry(scale * 0.7, scale * 3.4, scale * 0.7), mat);
    const b = a.clone();
    const c = new THREE.Mesh(new THREE.BoxGeometry(scale * 2.5, scale * 0.7, scale * 0.7), mat);
    a.position.set(-scale, scale * 1.4, 0);
    b.position.set(scale, scale * 1.4, 0);
    c.position.set(0, scale * 3, 0);
    group.add(a, b, c);
    return group;
  }
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(scale * 0.18, scale * 0.25, scale * 1.7, 7), new THREE.MeshStandardMaterial({ color: 0x5a3b25 }));
  const leaves = new THREE.Mesh(new THREE.ConeGeometry(scale * 0.9, scale * 2.3, 9), new THREE.MeshStandardMaterial({ color: template.accents[0] }));
  trunk.position.y = scale * 0.8;
  leaves.position.y = scale * 2.2;
  group.add(trunk, leaves);
  return group;
}

function refreshRouteMarkers() {
  if (!OC.world) return;
  const old = OC.world.getObjectByName('route-markers');
  if (old) OC.world.remove(old);
  const group = new THREE.Group();
  group.name = 'route-markers';
  if (oc$('obstacle-show-markers')?.checked !== false) {
    const routeMat = new THREE.MeshBasicMaterial({ color: 0x8ffbf0, transparent: true, opacity: 0.86 });
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xeec45a, transparent: true, opacity: 0.88 });
    OC.route.forEach((point, i) => {
      if (i % 2) return;
      const marker = new THREE.Mesh(new THREE.TorusGeometry(OC.pathWidth / 2, 0.035, 8, 32), routeMat);
      marker.position.set(point.x, point.y, point.z);
      marker.rotation.x = Math.PI / 2;
      group.add(marker);
      if (i % 6 === 0) {
        const mote = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), ringMat);
        mote.position.set(point.x, point.y, point.z + 0.35);
        group.add(mote);
      }
    });
  }
  OC.world.add(group);
}

function routeAtDistance(distance) {
  const z = -distance;
  for (let i = 1; i < OC.route.length; i += 1) {
    const prev = OC.route[i - 1];
    const next = OC.route[i];
    if (z >= next.z) {
      const span = prev.z - next.z || 1;
      const t = (prev.z - z) / span;
      return { x: prev.x + (next.x - prev.x) * t, y: prev.y + (next.y - prev.y) * t, z };
    }
  }
  return OC.route[OC.route.length - 1] || { x: 0, y: 2, z };
}

function addObstacles(count) {
  const template = OC_TEMPLATES[OC.templateId] || OC_TEMPLATES.forest_lake;
  const matDanger = new THREE.MeshStandardMaterial({ color: 0x6d2f35, roughness: 0.62, emissive: 0x1a0508, emissiveIntensity: 0.22 });
  for (let i = 0; i < count; i += 1) {
    const d = 70 + Math.random() * (OC.courseLength - 120);
    const p = routeAtDistance(d);
    const off = (Math.random() < 0.5 ? -1 : 1) * (OC.pathWidth * 0.72 + Math.random() * 3.3);
    const yoff = (Math.random() - 0.5) * 2.4;
    const type = template.obstacles[Math.floor(Math.random() * template.obstacles.length)];
    const mesh = createObstacleMesh(type, matDanger);
    mesh.position.set(p.x + off, clamp(p.y + yoff, -0.3, 6.6), -d);
    mesh.rotation.set(Math.random() * 0.6, Math.random() * Math.PI, Math.random() * 0.4);
    mesh.userData = { kind: 'obstacle', type, hit: false, radius: type === 'peak' ? 1.35 : 1.05 };
    OC.world.add(mesh);
    OC.objects.push(mesh);
  }
}

function createObstacleMesh(type, mat) {
  if (type === 'peak') return new THREE.Mesh(new THREE.ConeGeometry(1.25, 3.2, 5), mat.clone());
  if (type === 'storm') return new THREE.Mesh(new THREE.SphereGeometry(1.15, 14, 10), new THREE.MeshStandardMaterial({ color: 0x37425b, roughness: 0.9, emissive: 0x11172a, emissiveIntensity: 0.25 }));
  if (type === 'branch') {
    const group = new THREE.Group();
    const branchMat = new THREE.MeshStandardMaterial({ color: 0x4e3220, roughness: 0.85 });
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.22, 2.9, 8), branchMat);
    branch.rotation.z = Math.PI / 2.8;
    const leaves = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), new THREE.MeshStandardMaterial({ color: 0x2d6b42 }));
    leaves.position.x = 1.1;
    group.add(branch, leaves);
    return group;
  }
  if (type === 'arch') {
    const group = new THREE.Group();
    const stone = new THREE.MeshStandardMaterial({ color: 0x675b76, roughness: 0.86 });
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.5, 0.45), stone);
    const b = a.clone();
    const c = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.45, 0.45), stone);
    a.position.x = -0.9; b.position.x = 0.9; c.position.y = 1.2;
    group.add(a, b, c);
    return group;
  }
  return new THREE.Mesh(new THREE.DodecahedronGeometry(1.05, 0), mat.clone());
}

function addCollectibles(count) {
  const mat = new THREE.MeshBasicMaterial({ color: 0xeec45a });
  for (let i = 0; i < count; i += 1) {
    const d = 45 + Math.random() * (OC.courseLength - 90);
    const p = routeAtDistance(d);
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 16), mat.clone());
    mesh.position.set(p.x + (Math.random() - 0.5) * OC.pathWidth * 0.9, p.y + (Math.random() - 0.5) * 0.8, -d);
    mesh.userData = { kind: 'collectible', collected: false, radius: 0.7 };
    const light = new THREE.PointLight(0xeec45a, 0.7, 8);
    mesh.add(light);
    OC.world.add(mesh);
    OC.objects.push(mesh);
  }
}

function resetRun(keepMessage = false) {
  OC.running = false;
  OC.complete = false;
  OC.distance = 0;
  OC.score = 0;
  OC.hits = 0;
  OC.pathMisses = 0;
  OC.collected = 0;
  OC.player.x = 0;
  OC.player.y = 0;
  OC.lastPenaltyAt = 0;
  OC.objects.forEach((obj) => {
    obj.visible = true;
    obj.userData.hit = false;
    obj.userData.collected = false;
  });
  updateWorldPositions();
  updateStats();
  if (!keepMessage && oc$('obstacle-result')) setResult('Course reset. Start the test when ready.', 'waiting');
}

function startRun() {
  if (OC.complete) resetRun(true);
  OC.running = true;
  OC.clock.getDelta();
  oc$('obstacle-status').textContent = 'Flying';
  setResult('POV flight test running. Steer through the glowing tunnel.', 'waiting');
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
    checkPathPenalty();
    checkCollisions();
    if (OC.distance >= OC.courseLength) finishRun();
    updateStats();
  }
  drawFrame();
  if (OC.running) OC.frame = requestAnimationFrame(tickRun);
}

function updatePlayer(dt) {
  let dx = 0, dy = 0;
  if (OC.keys.has('arrowup') || OC.keys.has('w')) dy += 1;
  if (OC.keys.has('arrowdown') || OC.keys.has('s')) dy -= 1;
  if (OC.keys.has('arrowleft') || OC.keys.has('a')) dx -= 1;
  if (OC.keys.has('arrowright') || OC.keys.has('d')) dx += 1;
  OC.player.x = clamp(OC.player.x + dx * OC.steerSpeed * dt, -6.5, 6.5);
  OC.player.y = clamp(OC.player.y + dy * OC.steerSpeed * dt, -2.3, 4.6);
  updateWorldPositions();
}

function updateWorldPositions() {
  const guide = routeAtDistance(OC.distance + 20);
  OC.camera.position.set(OC.player.x, 2.2 + OC.player.y, 8);
  OC.camera.lookAt(guide.x + OC.player.x * 0.25, guide.y, -34);
  if (OC.world) OC.world.position.z = OC.distance;
}

function checkPathPenalty() {
  const guide = routeAtDistance(OC.distance + 20);
  const dx = OC.player.x - guide.x;
  const dy = (2.2 + OC.player.y) - guide.y;
  const outside = Math.hypot(dx, dy) > OC.pathWidth / 2;
  const now = performance.now();
  if (outside && now - OC.lastPenaltyAt > 950) {
    OC.score -= 1;
    OC.pathMisses += 1;
    OC.lastPenaltyAt = now;
  }
}

function checkCollisions() {
  const playerPos = new THREE.Vector3(OC.player.x, 2.2 + OC.player.y, -OC.distance - 20);
  OC.objects.forEach((obj) => {
    if (!obj.visible) return;
    const dist = obj.getWorldPosition(new THREE.Vector3()).distanceTo(playerPos);
    if (obj.userData.kind === 'obstacle' && !obj.userData.hit && dist < obj.userData.radius + 1.0) {
      obj.userData.hit = true;
      obj.visible = false;
      OC.hits += 1;
      OC.score -= 1;
    }
    if (obj.userData.kind === 'collectible' && !obj.userData.collected && dist < obj.userData.radius + 1.0) {
      obj.userData.collected = true;
      obj.visible = false;
      OC.collected += 1;
      OC.score += 5;
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
  oc$('obstacle-path-misses').textContent = String(OC.pathMisses);
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
  OC.objects.forEach((obj) => {
    if (obj.userData.kind === 'collectible') {
      obj.rotation.y += 0.018;
      obj.scale.setScalar(1 + Math.sin(performance.now() * 0.006 + obj.position.z) * 0.12);
    }
    if (obj.userData.kind === 'obstacle') obj.rotation.y += 0.004;
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
    pathWidth: OC.pathWidth,
    successScore: OC.successScore,
    successEventId: OC.successEventId,
    failureEventId: OC.failureEventId,
    successOutcomeKey: OC.successOutcomeKey,
    failureOutcomeKey: OC.failureOutcomeKey,
    score: OC.score,
    hits: OC.hits,
    pathMisses: OC.pathMisses,
    collected: OC.collected,
  }),
};
