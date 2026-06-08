// Obstacle Course / Flying Practice V1
// Integrated runtime for Artifex Puzzle Creator.
// Adds a first playable guided flight course with route markers, obstacles,
// collectibles, score penalties and success/failure event keys.

const OC_TEMPLATES = {
  forest_lake: {
    label: 'Forest Lake Flight',
    environment: 'forest_lake',
    objective: 'Follow the glowing path over the lake, avoid branches and stones, and collect light motes.',
    palette: ['#06130b', '#12351f', '#17324b'],
    obstacleTypes: ['branch', 'rock', 'storm'],
  },
  mountain_pass: {
    label: 'Mountain Pass',
    environment: 'mountains',
    objective: 'Thread through mountain peaks and floating rocks without drifting from the guide path.',
    palette: ['#07101c', '#1d2838', '#342f52'],
    obstacleTypes: ['peak', 'rock', 'storm'],
  },
  ruined_arches: {
    label: 'Ruined Arches',
    environment: 'ruins',
    objective: 'Fly through broken stone arches, follow the markers, and collect the glowing relic motes.',
    palette: ['#09070d', '#1e1930', '#32433a'],
    obstacleTypes: ['arch', 'rock', 'storm'],
  },
};

const OC_OBSTACLE_META = {
  branch: { label: 'Tree Branch', emoji: '🌿', radius: 30 },
  rock: { label: 'Floating Rock', emoji: '◆', radius: 28 },
  storm: { label: 'Storm Cloud', emoji: '☁', radius: 34 },
  peak: { label: 'Mountain Peak', emoji: '▲', radius: 38 },
  arch: { label: 'Broken Arch', emoji: '⌂', radius: 34 },
};

const OC = {
  mounted: false,
  active: false,
  running: false,
  complete: false,
  templateId: 'forest_lake',
  difficulty: 2,
  duration: 42,
  courseLength: 2600,
  speed: 90,
  pathWidth: 88,
  score: 0,
  hits: 0,
  pathMisses: 0,
  collected: 0,
  distance: 0,
  lastTime: 0,
  penaltyCooldown: 0,
  player: { x: 128, y: 260, radius: 18 },
  keys: new Set(),
  route: [],
  obstacles: [],
  collectibles: [],
  bgImage: null,
  successScore: 20,
  successEventId: 'obstacle_course_success',
  failureEventId: 'obstacle_course_failure',
  successOutcomeKey: 'flying_practice_success',
  failureOutcomeKey: 'flying_practice_failure',
  canvas: null,
  ctx: null,
  stage: null,
  panels: null,
};

const oc$ = (id) => document.getElementById(id);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function injectObstacleStyles() {
  if (oc$('obstacle-course-styles')) return;
  const style = document.createElement('style');
  style.id = 'obstacle-course-styles';
  style.textContent = `
    .is-obstacle-course .right-preview-layout,.is-obstacle-course .overview-window{display:none!important}
    .is-obstacle-course .left-panel-body>[data-panel-content],.is-obstacle-course #puzzle-launcher-panel{display:none!important}
    .is-obstacle-course [data-workflow-menu],.is-obstacle-course [data-workflow-only]{display:none!important}
    .obstacle-course-stage{height:100%;overflow:auto;padding:18px 20px 22px;background:radial-gradient(circle at 38% 0%,rgba(80,120,180,.22),transparent 34%),#05080d;color:var(--cream,#f4ead4)}
    .obstacle-workspace{display:grid;grid-template-columns:minmax(520px,1fr) 292px;gap:14px;align-items:start}
    .obstacle-view-card,.obstacle-side-card{border:1px solid rgba(124,202,210,.24);border-radius:16px;background:rgba(7,14,22,.84);box-shadow:0 12px 34px rgba(0,0,0,.28)}
    .obstacle-view-card{padding:16px;display:flex;flex-direction:column;gap:12px;min-height:min(690px,calc(100vh - 150px))}
    .obstacle-header-line{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid rgba(124,202,210,.18);padding-bottom:12px}
    .obstacle-header-line h2{font-family:'Cinzel',serif;margin:3px 0 0;font-size:1.38rem}.obstacle-header-line p{margin:8px 0 0;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.42}
    .obstacle-status-pill{border:1px solid rgba(238,196,90,.34);border-radius:999px;color:#eec45a;padding:6px 10px;font-size:.68rem;font-weight:900;white-space:nowrap}
    .obstacle-canvas-wrap{position:relative;min-height:430px;border:1px solid rgba(124,202,210,.18);border-radius:18px;overflow:hidden;background:#07101c}
    #obstacle-course-canvas{display:block;width:100%;height:430px;touch-action:none}
    .obstacle-help-strip{display:flex;justify-content:space-between;gap:10px;color:var(--muted,#c9bfae);font-size:.72rem;line-height:1.35}
    .obstacle-control-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.obstacle-control-row button{min-height:42px;border:1px solid rgba(124,202,125,.3);border-radius:10px;background:rgba(20,72,37,.62);color:var(--cream,#f4ead4);font-weight:900;cursor:pointer}.obstacle-control-row button:hover{border-color:rgba(158,230,164,.62)}
    .obstacle-side-card{padding:16px 14px;display:flex;flex-direction:column;gap:11px}.obstacle-side-card h3{font-family:'Cinzel',serif;margin:0;font-size:1.03rem}
    .obstacle-metric{display:flex;justify-content:space-between;border:1px solid rgba(124,202,210,.2);border-radius:11px;padding:10px;color:var(--muted,#c9bfae);font-size:.76rem}.obstacle-metric strong{color:var(--cream,#f4ead4)}
    .obstacle-result{min-height:64px;border:1px solid rgba(124,202,210,.22);border-radius:11px;padding:11px;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.4}.obstacle-result[data-state='success']{border-color:#69ad70;color:#9ee6a4;background:#214b2b}.obstacle-result[data-state='failure']{border-color:#cc6d55;color:#f0a088;background:#4a1d1a}.obstacle-result[data-state='warn']{border-color:#c9a64a;color:#eec45a;background:#3c2c12}
    .obstacle-panel-copy{font-size:.73rem;line-height:1.46;color:var(--muted,#c9bfae);margin:0 0 14px}.obstacle-event-block,.obstacle-score-block{padding:12px;margin:0 0 10px;border-radius:11px;background:rgba(20,35,54,.42);border:1px solid rgba(124,202,210,.17)}.obstacle-event-block small,.obstacle-score-block small{display:block;color:#eec45a;font-size:.63rem;letter-spacing:.13em;text-transform:uppercase;font-weight:800;margin-bottom:7px}.obstacle-event-block p,.obstacle-score-block p{margin:0;font-size:.77rem;line-height:1.5;color:var(--cream,#f4ead4)}
    .obstacle-mini-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.obstacle-mini-grid button{min-height:38px;border:1px solid rgba(124,202,125,.28);border-radius:9px;background:rgba(20,72,37,.58);color:var(--cream,#f4ead4);font-weight:900}
    @media(max-width:1080px){.obstacle-workspace{grid-template-columns:1fr}.obstacle-view-card{min-height:560px}.obstacle-side-card{min-height:220px}}
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
  regenerateCourse();
  drawObstacleCourse();
}

export function closeObstacleCourseWorkflow() {
  if (!OC.mounted) return;
  OC.active = false;
  OC.running = false;
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
          <div><p class="eyebrow">Obstacle Course · Playable Prototype</p><h2 id="obstacle-title">Flying Practice</h2><p id="obstacle-objective"></p></div>
          <span id="obstacle-status" class="obstacle-status-pill">Ready</span>
        </div>
        <div class="obstacle-canvas-wrap"><canvas id="obstacle-course-canvas" width="980" height="430"></canvas></div>
        <div class="obstacle-help-strip"><span>Move Mel with WASD / arrows. Follow glowing markers, avoid obstacles, collect motes.</span><span id="obstacle-course-summary">0m / 0m</span></div>
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
      <div class="panel-title-row"><div><p class="eyebrow">01 · Construction</p><h2>Flying Practice</h2></div><span class="status-pill is-waiting">V1</span></div>
      <p class="obstacle-panel-copy">First playable Obstacle Course module: guided route markers, approaching obstacles, collectibles and score rules.</p>
      <label class="field-block"><span>Course Template</span><select id="obstacle-template"><option value="forest_lake">Forest Lake Flight</option><option value="mountain_pass">Mountain Pass</option><option value="ruined_arches">Ruined Arches</option></select></label>
      <label class="range-row"><span>Difficulty <output id="obstacle-difficulty-out">2</output></span><input id="obstacle-difficulty" type="range" min="1" max="5" value="2" /></label>
      <label class="range-row"><span>Course Duration <output id="obstacle-duration-out">42s</output></span><input id="obstacle-duration" type="range" min="20" max="75" step="5" value="42" /></label>
      <button id="obstacle-regenerate" class="wide-button" type="button">Regenerate Course</button>
    </section>
    <section class="panel tool-panel obstacle-panel" data-obstacle-panel="display" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">02 · Display</p><h2>Display</h2></div></div>
      <label class="range-row"><span>Speed <output id="obstacle-speed-out">90</output></span><input id="obstacle-speed" type="range" min="55" max="150" step="5" value="90" /></label>
      <label class="range-row"><span>Guide Path Width <output id="obstacle-path-width-out">88px</output></span><input id="obstacle-path-width" type="range" min="45" max="150" step="5" value="88" /></label>
      <label class="toggle-row"><span><strong>Show route markers</strong><small>Display glowing guide dots.</small></span><input id="obstacle-show-markers" type="checkbox" checked /></label>
      <label class="field-block"><span>Background Image</span><input id="obstacle-bg-file" class="file-input-hidden" type="file" accept="image/*" /><button id="obstacle-bg-proxy" class="wide-button" type="button">Choose Background PNG</button></label>
    </section>
    <section class="panel tool-panel obstacle-panel" data-obstacle-panel="logic" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">03 · Logic</p><h2>Scoring + Events</h2></div></div>
      <div class="obstacle-score-block"><small>Scoring</small><p>Follow the glowing route: no penalty. Outside the route: -1. Hit obstacle: -1. Collect glowing mote: +5. Finish course: resolve success/failure by target score.</p></div>
      <label class="range-row"><span>Success Score <output id="obstacle-success-score-out">20</output></span><input id="obstacle-success-score" type="range" min="0" max="80" step="5" value="20" /></label>
      <label class="field-block"><span>Success Event ID</span><input id="obstacle-success-event" type="text" value="obstacle_course_success" /></label>
      <label class="field-block"><span>Success Quest Outcome Key</span><input id="obstacle-success-outcome" type="text" value="flying_practice_success" /></label>
      <label class="field-block"><span>Failure Event ID</span><input id="obstacle-failure-event" type="text" value="obstacle_course_failure" /></label>
      <label class="field-block"><span>Failure Quest Outcome Key</span><input id="obstacle-failure-outcome" type="text" value="flying_practice_failure" /></label>
    </section>
    <section class="panel tool-panel obstacle-panel" data-obstacle-panel="visuals" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">04 · Colors</p><h2>Course Objects</h2></div></div>
      <p class="obstacle-panel-copy">V1 uses generated obstacle/collectible patterns. Later this can bind to Asset Library sprites and Effects Library trail/glow effects.</p>
      <div class="obstacle-mini-grid"><button id="obstacle-add-obstacles" type="button">More Obstacles</button><button id="obstacle-add-collectibles" type="button">More Collectibles</button></div>
    </section>`;
  leftBody.appendChild(OC.panels);

  OC.canvas = oc$('obstacle-course-canvas');
  OC.ctx = OC.canvas.getContext('2d');
  bindObstacleControls();
  OC.mounted = true;
}

function bindObstacleControls() {
  oc$('obstacle-template').addEventListener('change', (event) => {
    OC.templateId = event.target.value;
    regenerateCourse();
  });
  oc$('obstacle-difficulty').addEventListener('input', (event) => {
    OC.difficulty = Number(event.target.value);
    oc$('obstacle-difficulty-out').textContent = String(OC.difficulty);
    regenerateCourse();
  });
  oc$('obstacle-duration').addEventListener('input', (event) => {
    OC.duration = Number(event.target.value);
    oc$('obstacle-duration-out').textContent = `${OC.duration}s`;
    regenerateCourse();
  });
  oc$('obstacle-speed').addEventListener('input', (event) => {
    OC.speed = Number(event.target.value);
    oc$('obstacle-speed-out').textContent = String(OC.speed);
    regenerateCourse();
  });
  oc$('obstacle-path-width').addEventListener('input', (event) => {
    OC.pathWidth = Number(event.target.value);
    oc$('obstacle-path-width-out').textContent = `${OC.pathWidth}px`;
    drawObstacleCourse();
  });
  oc$('obstacle-success-score').addEventListener('input', (event) => {
    OC.successScore = Number(event.target.value);
    oc$('obstacle-success-score-out').textContent = String(OC.successScore);
    oc$('obstacle-target-score').textContent = String(OC.successScore);
  });
  oc$('obstacle-success-event').addEventListener('input', (event) => { OC.successEventId = event.target.value; });
  oc$('obstacle-failure-event').addEventListener('input', (event) => { OC.failureEventId = event.target.value; });
  oc$('obstacle-success-outcome').addEventListener('input', (event) => { OC.successOutcomeKey = event.target.value; });
  oc$('obstacle-failure-outcome').addEventListener('input', (event) => { OC.failureOutcomeKey = event.target.value; });
  oc$('obstacle-regenerate').addEventListener('click', regenerateCourse);
  oc$('obstacle-start').addEventListener('click', startRun);
  oc$('obstacle-pause').addEventListener('click', pauseRun);
  oc$('obstacle-reset-run').addEventListener('click', () => resetRun(false));
  oc$('obstacle-show-markers').addEventListener('change', drawObstacleCourse);
  oc$('obstacle-bg-proxy').addEventListener('click', () => oc$('obstacle-bg-file').click());
  oc$('obstacle-bg-file').addEventListener('change', handleBackgroundImage);
  oc$('obstacle-add-obstacles').addEventListener('click', () => { addGeneratedObstacles(4); drawObstacleCourse(); });
  oc$('obstacle-add-collectibles').addEventListener('click', () => { addGeneratedCollectibles(4); drawObstacleCourse(); });

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

function handleBackgroundImage(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => { OC.bgImage = img; drawObstacleCourse(); };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function regenerateCourse() {
  OC.courseLength = Math.max(1600, OC.duration * OC.speed);
  resetRun(true);
  generateRoute();
  generateObjects();
  updateTemplateText();
  drawObstacleCourse();
}

function updateTemplateText() {
  const template = OC_TEMPLATES[OC.templateId] || OC_TEMPLATES.forest_lake;
  oc$('obstacle-title').textContent = template.label;
  oc$('obstacle-objective').textContent = template.objective;
  oc$('obstacle-target-score').textContent = String(OC.successScore);
}

function generateRoute() {
  const height = OC.canvas?.height || 430;
  const steps = 42;
  const amplitude = 78 + OC.difficulty * 8;
  const offset = Math.random() * 6.28;
  OC.route = [];
  for (let index = 0; index <= steps; index += 1) {
    const x = (OC.courseLength / steps) * index;
    const wave = Math.sin(index * 0.55 + offset) * amplitude + Math.sin(index * 0.18 + offset * 0.7) * 34;
    const y = clamp(height / 2 + wave, 78, height - 78);
    OC.route.push({ x, y });
  }
}

function generateObjects() {
  OC.obstacles = [];
  OC.collectibles = [];
  addGeneratedObstacles(8 + OC.difficulty * 5);
  addGeneratedCollectibles(7 + OC.difficulty * 2);
}

function routeYAt(worldX) {
  if (!OC.route.length) return (OC.canvas?.height || 430) / 2;
  for (let index = 1; index < OC.route.length; index += 1) {
    const prev = OC.route[index - 1];
    const next = OC.route[index];
    if (worldX <= next.x) {
      const t = (worldX - prev.x) / Math.max(1, next.x - prev.x);
      return prev.y + (next.y - prev.y) * t;
    }
  }
  return OC.route[OC.route.length - 1].y;
}

function addGeneratedObstacles(count) {
  const template = OC_TEMPLATES[OC.templateId] || OC_TEMPLATES.forest_lake;
  const height = OC.canvas?.height || 430;
  for (let index = 0; index < count; index += 1) {
    const x = 360 + Math.random() * (OC.courseLength - 520);
    const nearPath = Math.random() < 0.62;
    const routeY = routeYAt(x);
    const y = nearPath ? clamp(routeY + (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 90), 48, height - 48) : 55 + Math.random() * (height - 110);
    const type = template.obstacleTypes[Math.floor(Math.random() * template.obstacleTypes.length)];
    OC.obstacles.push({ id: `ob_${Date.now()}_${index}_${Math.random()}`, x, y, type, hit: false });
  }
}

function addGeneratedCollectibles(count) {
  const height = OC.canvas?.height || 430;
  for (let index = 0; index < count; index += 1) {
    const x = 260 + Math.random() * (OC.courseLength - 420);
    const y = clamp(routeYAt(x) + (Math.random() - 0.5) * OC.pathWidth * 0.7, 45, height - 45);
    OC.collectibles.push({ id: `co_${Date.now()}_${index}_${Math.random()}`, x, y, collected: false });
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
  OC.penaltyCooldown = 0;
  OC.player.y = (OC.canvas?.height || 430) / 2;
  OC.obstacles.forEach((obstacle) => { obstacle.hit = false; });
  OC.collectibles.forEach((collectible) => { collectible.collected = false; });
  updateStats();
  if (!keepMessage && oc$('obstacle-result')) setResult('Course reset. Start the test when ready.', 'waiting');
  drawObstacleCourse();
}

function startRun() {
  if (OC.complete) resetRun(true);
  OC.running = true;
  OC.lastTime = performance.now();
  oc$('obstacle-status').textContent = 'Flying';
  setResult('Flight test running. Keep Mel close to the glowing route.', 'waiting');
  requestAnimationFrame(tickRun);
}

function pauseRun() {
  OC.running = false;
  oc$('obstacle-status').textContent = 'Paused';
  setResult('Flight test paused.', 'warn');
}

function tickRun(now) {
  if (!OC.running || !OC.active) return;
  const dt = Math.min(0.05, (now - OC.lastTime) / 1000 || 0.016);
  OC.lastTime = now;
  updatePlayer(dt);
  OC.distance += OC.speed * dt;
  OC.penaltyCooldown = Math.max(0, OC.penaltyCooldown - dt);
  checkPathPenalty();
  checkCollisions();
  if (OC.distance >= OC.courseLength) {
    finishRun();
    return;
  }
  updateStats();
  drawObstacleCourse();
  requestAnimationFrame(tickRun);
}

function updatePlayer(dt) {
  const moveSpeed = 210;
  let dx = 0;
  let dy = 0;
  if (OC.keys.has('arrowup') || OC.keys.has('w')) dy -= 1;
  if (OC.keys.has('arrowdown') || OC.keys.has('s')) dy += 1;
  if (OC.keys.has('arrowleft') || OC.keys.has('a')) dx -= 1;
  if (OC.keys.has('arrowright') || OC.keys.has('d')) dx += 1;
  OC.player.x = clamp(OC.player.x + dx * moveSpeed * dt, 80, 230);
  OC.player.y = clamp(OC.player.y + dy * moveSpeed * dt, 36, (OC.canvas?.height || 430) - 36);
}

function checkPathPenalty() {
  const routeY = routeYAt(OC.distance + OC.player.x);
  const offPath = Math.abs(OC.player.y - routeY) > OC.pathWidth / 2;
  if (offPath && OC.penaltyCooldown <= 0) {
    OC.score -= 1;
    OC.pathMisses += 1;
    OC.penaltyCooldown = 1.05;
  }
}

function checkCollisions() {
  const playerWorldX = OC.distance + OC.player.x;
  OC.obstacles.forEach((obstacle) => {
    if (obstacle.hit) return;
    const meta = OC_OBSTACLE_META[obstacle.type] || OC_OBSTACLE_META.rock;
    const dist = Math.hypot(obstacle.x - playerWorldX, obstacle.y - OC.player.y);
    if (dist < meta.radius + OC.player.radius) {
      obstacle.hit = true;
      OC.hits += 1;
      OC.score -= 1;
    }
  });
  OC.collectibles.forEach((collectible) => {
    if (collectible.collected) return;
    const dist = Math.hypot(collectible.x - playerWorldX, collectible.y - OC.player.y);
    if (dist < 28 + OC.player.radius) {
      collectible.collected = true;
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
  drawObstacleCourse();
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

function drawObstacleCourse() {
  if (!OC.ctx || !OC.canvas) return;
  const ctx = OC.ctx;
  const width = OC.canvas.width;
  const height = OC.canvas.height;
  const template = OC_TEMPLATES[OC.templateId] || OC_TEMPLATES.forest_lake;
  ctx.clearRect(0, 0, width, height);

  if (OC.bgImage) {
    ctx.drawImage(OC.bgImage, 0, 0, width, height);
    ctx.fillStyle = 'rgba(4, 8, 12, .42)';
    ctx.fillRect(0, 0, width, height);
  } else {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, template.palette[0]);
    gradient.addColorStop(0.55, template.palette[1]);
    gradient.addColorStop(1, template.palette[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  drawScenery(ctx, width, height, template.environment);
  drawRoute(ctx);
  drawObjects(ctx);
  drawPlayer(ctx);
}

function drawScenery(ctx, width, height, environment) {
  ctx.save();
  ctx.globalAlpha = 0.32;
  ctx.fillStyle = '#eec45a';
  for (let i = 0; i < 36; i += 1) {
    const x = (i * 83 - (OC.distance * 0.18) % 83 + width) % width;
    const y = 35 + ((i * 47) % 140);
    ctx.beginPath();
    ctx.arc(x, y, i % 5 === 0 ? 2.4 : 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 0.5;
  if (environment === 'mountains') {
    ctx.fillStyle = '#26354a';
    for (let i = 0; i < 10; i += 1) {
      const baseX = i * 160 - (OC.distance * 0.28) % 160;
      ctx.beginPath();
      ctx.moveTo(baseX, height);
      ctx.lineTo(baseX + 85, height - 180 - (i % 3) * 28);
      ctx.lineTo(baseX + 180, height);
      ctx.fill();
    }
  } else if (environment === 'ruins') {
    ctx.strokeStyle = 'rgba(224,205,170,.35)';
    ctx.lineWidth = 5;
    for (let i = 0; i < 8; i += 1) {
      const x = i * 190 - (OC.distance * 0.32) % 190;
      ctx.strokeRect(x, height - 210, 90, 170);
    }
  } else {
    ctx.fillStyle = '#102c1b';
    ctx.fillRect(0, height - 82, width, 82);
    ctx.fillStyle = 'rgba(70,145,170,.38)';
    ctx.fillRect(0, height - 130, width, 55);
  }
  ctx.restore();
}

function drawRoute(ctx) {
  const visibleRoute = OC.route.map((point) => ({ x: point.x - OC.distance, y: point.y })).filter((point) => point.x > -80 && point.x < OC.canvas.width + 80);
  if (visibleRoute.length < 2) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(130, 232, 226, .18)';
  ctx.lineWidth = OC.pathWidth;
  ctx.beginPath();
  visibleRoute.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
  ctx.stroke();
  ctx.strokeStyle = 'rgba(135, 255, 245, .72)';
  ctx.lineWidth = 7;
  ctx.beginPath();
  visibleRoute.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
  ctx.stroke();
  if (oc$('obstacle-show-markers')?.checked !== false) {
    visibleRoute.forEach((point, index) => {
      if (index % 2) return;
      ctx.fillStyle = 'rgba(238,196,90,.92)';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  ctx.restore();
}

function drawObjects(ctx) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  OC.obstacles.forEach((obstacle) => {
    const x = obstacle.x - OC.distance;
    if (x < -70 || x > OC.canvas.width + 70) return;
    const meta = OC_OBSTACLE_META[obstacle.type] || OC_OBSTACLE_META.rock;
    ctx.globalAlpha = obstacle.hit ? 0.24 : 0.92;
    ctx.fillStyle = obstacle.hit ? 'rgba(219,112,83,.5)' : 'rgba(10,12,18,.72)';
    ctx.beginPath();
    ctx.arc(x, obstacle.y, meta.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f4ead4';
    ctx.font = `${Math.max(24, meta.radius)}px serif`;
    ctx.fillText(meta.emoji, x, obstacle.y + 1);
  });
  OC.collectibles.forEach((collectible) => {
    const x = collectible.x - OC.distance;
    if (x < -50 || x > OC.canvas.width + 50 || collectible.collected) return;
    ctx.globalAlpha = 0.95;
    ctx.shadowColor = '#eec45a';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#eec45a';
    ctx.beginPath();
    ctx.arc(x, collectible.y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff6c8';
    ctx.font = '17px serif';
    ctx.fillText('✦', x, collectible.y + 1);
  });
  ctx.restore();
}

function drawPlayer(ctx) {
  ctx.save();
  ctx.translate(OC.player.x, OC.player.y);
  ctx.shadowColor = '#9ee6a4';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#f4ead4';
  ctx.beginPath();
  ctx.arc(0, 0, OC.player.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#9ee6a4';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-18, 3);
  ctx.quadraticCurveTo(-42, -22, -58, 2);
  ctx.moveTo(18, 3);
  ctx.quadraticCurveTo(42, -22, 58, 2);
  ctx.stroke();
  ctx.fillStyle = '#07100a';
  ctx.font = '18px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('M', 0, 1);
  ctx.restore();
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
