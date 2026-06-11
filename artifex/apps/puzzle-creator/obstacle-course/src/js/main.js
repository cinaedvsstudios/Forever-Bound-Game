const UI_VERSION = 'V2.5';
const MODULE_VERSION = '2.5.1';
const ASSET_ROOT = './assets/';

function whenReady() {
  if (document.readyState === 'loading') {
    return new Promise((resolve) => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
  }
  return Promise.resolve();
}

function $(selector) {
  return document.querySelector(selector);
}

function injectBootStyles() {
  if (document.getElementById('obstacle-boot-styles')) return;
  const style = document.createElement('style');
  style.id = 'obstacle-boot-styles';
  style.textContent = `
    .obstacle-boot-card{margin:14px;border:1px solid rgba(238,196,90,.38);border-radius:18px;background:rgba(7,14,22,.88);padding:18px;color:var(--cream,#f4ead4);box-shadow:0 14px 40px rgba(0,0,0,.32)}
    .obstacle-boot-card h2{font-family:Cinzel,Georgia,serif;margin:4px 0 8px;font-size:1.18rem}.obstacle-boot-card p{color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.45;margin:0 0 8px}.obstacle-boot-note{font-family:monospace;color:#eec45a;font-size:.7rem;word-break:break-word;margin-top:10px}.obstacle-boot-buttons{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.obstacle-boot-buttons button,.obstacle-safety-button{min-height:34px;border:1px solid rgba(124,202,125,.34);border-radius:9px;background:rgba(20,72,37,.62);color:var(--cream,#f4ead4);font-weight:900;cursor:pointer}.obstacle-safety-stage{height:calc(100vh - 92px);overflow:auto;padding:12px 14px 14px;background:#05080d;color:var(--cream,#f4ead4);box-sizing:border-box}.obstacle-safety-grid{display:grid;grid-template-columns:minmax(520px,1fr) 320px;gap:14px;height:100%;min-height:0}.obstacle-safety-view,.obstacle-safety-side{border:1px solid rgba(124,202,210,.24);border-radius:16px;background:rgba(7,14,22,.86);box-shadow:0 12px 34px rgba(0,0,0,.28);padding:14px;min-height:0;overflow:auto}.obstacle-safety-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;border-bottom:1px solid rgba(124,202,210,.18);padding-bottom:12px;margin-bottom:12px}.obstacle-safety-head h2{font-family:Cinzel,Georgia,serif;margin:2px 0 0;font-size:1.35rem}.obstacle-safety-head p{margin:8px 0 0;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.42}.obstacle-safety-pill{border:1px solid rgba(238,196,90,.34);border-radius:999px;color:#eec45a;padding:6px 10px;font-size:.68rem;font-weight:900;white-space:nowrap}.obstacle-safety-canvas-wrap{position:relative;border:1px solid rgba(124,202,210,.18);border-radius:18px;overflow:hidden;background:#07101c;aspect-ratio:16/9}.obstacle-safety-canvas{display:block;width:100%;height:100%}.obstacle-safety-hud{position:absolute;left:14px;right:14px;bottom:12px;display:flex;justify-content:space-between;gap:12px;color:#f4ead4;font-size:.74rem;text-shadow:0 2px 5px rgba(0,0,0,.8);pointer-events:none}.obstacle-safety-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 10px}.obstacle-safety-row button{min-height:34px;border:1px solid rgba(124,202,125,.28);border-radius:9px;background:rgba(20,72,37,.58);color:var(--cream,#f4ead4);font-weight:900;cursor:pointer}.obstacle-safety-metric{display:flex;justify-content:space-between;border:1px solid rgba(124,202,210,.2);border-radius:11px;padding:8px;color:var(--muted,#c9bfae);font-size:.73rem;margin-bottom:8px}.obstacle-safety-metric strong{color:var(--cream,#f4ead4)}.obstacle-safety-result{min-height:46px;border:1px solid rgba(124,202,210,.22);border-radius:11px;padding:9px;color:var(--muted,#c9bfae);font-size:.74rem;line-height:1.35;margin:8px 0 12px}.obstacle-safety-result[data-state='warn']{border-color:#c9a64a;color:#eec45a;background:#3c2c12}.obstacle-safety-result[data-state='success']{border-color:#69ad70;color:#9ee6a4;background:#214b2b}.obstacle-safety-result[data-state='failure']{border-color:#cc6d55;color:#f0a088;background:#4a1d1a}.obstacle-safety-panel{border:1px solid rgba(124,202,210,.2);border-radius:12px;padding:10px;background:rgba(0,0,0,.2);margin-bottom:10px}.obstacle-safety-panel h3{font-family:Cinzel,Georgia,serif;margin:0 0 8px;font-size:1rem}.obstacle-safety-panel label{display:block;color:var(--muted,#c9bfae);font-size:.68rem;margin:8px 0 4px}.obstacle-safety-panel input,.obstacle-safety-panel select{width:100%;box-sizing:border-box;background:#0b1219;color:var(--cream,#f4ead4);border:1px solid rgba(124,202,210,.25);border-radius:8px;padding:6px}.obstacle-safety-small{color:var(--muted,#c9bfae);font-size:.66rem;line-height:1.35;margin:6px 0 0}.obstacle-safety-error{font-family:monospace;font-size:.66rem;color:#eec45a;word-break:break-word;border-top:1px solid rgba(238,196,90,.16);margin-top:10px;padding-top:8px}.hf-asset-debug-button{width:100%}
    @media(max-width:1120px){.obstacle-safety-grid{grid-template-columns:1fr}.obstacle-safety-stage{height:auto}.obstacle-safety-side{height:auto}.obstacle-boot-buttons{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
}

function setBootMessage(message, detail = '') {
  injectBootStyles();
  const rightPanel = $('.right-panel');
  const leftBody = $('.left-panel-body');
  if (!rightPanel || !leftBody) return;
  if (!document.getElementById('obstacle-boot-card')) {
    rightPanel.innerHTML = `<section id="obstacle-boot-card" class="obstacle-boot-card"><p class="eyebrow">Obstacle Course · ${UI_VERSION}</p><h2>Loading obstacle course...</h2><p id="obstacle-boot-message"></p><div id="obstacle-boot-detail" class="obstacle-boot-note"></div></section>`;
    leftBody.innerHTML = `<section class="panel obstacle-boot-card"><p class="eyebrow">Obstacle Course</p><h2>Boot Status</h2><p id="obstacle-left-boot-message">Loading...</p></section>`;
  }
  const msg = document.getElementById('obstacle-boot-message');
  const left = document.getElementById('obstacle-left-boot-message');
  const details = document.getElementById('obstacle-boot-detail');
  if (msg) msg.textContent = message;
  if (left) left.textContent = message;
  if (details) details.textContent = detail;
}

async function bootObstacleCourse() {
  await whenReady();
  setBootMessage('Loading asset debug and obstacle course runtime...');
  try {
    await import(`./engines/obstacle-course-asset-debug.js?v=${MODULE_VERSION}`);
  } catch (error) {
    console.warn('[ObstacleCourse] Asset Debug failed to load', error);
  }
  try {
    const runtime = await import(`./engines/obstacle-course-runtime.js?v=${MODULE_VERSION}`);
    setBootMessage('Runtime loaded. Opening course...');
    runtime.openObstacleCourseWorkflow();
    window.setTimeout(() => {
      const stage = document.getElementById('obstacle-course-stage');
      if (!stage || stage.hidden) {
        mountObstacleSafetyView(new Error('Runtime loaded but did not mount a visible stage.'));
      }
    }, 300);
  } catch (error) {
    console.error('[ObstacleCourse] Runtime failed; opening 2D safety view', error);
    mountObstacleSafetyView(error);
  }
}

function mountObstacleSafetyView(error) {
  injectBootStyles();
  document.body.classList.add('is-obstacle-course');
  document.body.classList.remove('is-puzzle-brief', 'is-puzzle-chooser');
  document.getElementById('obstacle-course-stage')?.remove();
  document.getElementById('obstacle-course-panels')?.remove();
  const rightPanel = $('.right-panel');
  const leftBody = $('.left-panel-body');
  if (!rightPanel || !leftBody) return;

  leftBody.innerHTML = `
    <section class="panel obstacle-safety-panel"><p class="eyebrow">01 · Construction</p><h2>Obstacle Course</h2><p class="obstacle-safety-small">2D safety view is active because the 3D runtime did not mount. Asset Debug remains available.</p><label>Course Template<select id="oc-template"><option value="forest">Obstacle Course</option><option value="dense">Dense Forest Course</option><option value="night">Moonlit Forest Course</option></select></label><label>Difficulty <output id="oc-difficulty-out">2</output><input id="oc-difficulty" type="range" min="1" max="5" value="2"></label><label>Course Duration <output id="oc-duration-out">45s</output><input id="oc-duration" type="range" min="20" max="300" step="5" value="45"></label></section>
    <section class="panel obstacle-safety-panel"><p class="eyebrow">02 · Display</p><h2>Ride Controls</h2><label>Horse Speed <output id="oc-speed-out">34</output><input id="oc-speed" type="range" min="18" max="64" step="2" value="34"></label><label>Lane Width <output id="oc-lane-out">2.7</output><input id="oc-lane" type="range" min="1.8" max="5" step="0.1" value="2.7"></label></section>`;

  rightPanel.innerHTML = `
    <section id="obstacle-course-stage" class="obstacle-safety-stage">
      <div class="obstacle-safety-grid">
        <section class="obstacle-safety-view">
          <div class="obstacle-safety-head"><div><p class="eyebrow">Obstacle Course · ${UI_VERSION}</p><h2>Obstacle Course</h2><p>Horse forest course with hold-to-move, steering, jump, duck reservation, course JSON export and Asset Debug.</p></div><span class="obstacle-safety-pill">2D Safety View</span></div>
          <div class="obstacle-safety-canvas-wrap"><canvas id="oc-canvas" class="obstacle-safety-canvas" width="1280" height="720"></canvas><div class="obstacle-safety-hud"><span>Hold ↑/W move · ↓/S back · ←/A/→/D steer · Ctrl duck · Space jump</span><span id="oc-summary">0m / 0m</span></div></div>
          <p class="obstacle-safety-small">This view prevents a blank screen when the 3D/WebGL runtime fails. It uses the same local asset folder root: ${ASSET_ROOT}</p>
          <div class="obstacle-safety-error">Runtime issue: ${escapeHtml(error?.message || String(error))}</div>
        </section>
        <aside class="obstacle-safety-side">
          <div class="obstacle-safety-row"><button id="oc-start" type="button">Start Test</button><button id="oc-pause" type="button">Pause</button><button id="oc-reset" type="button">Reset Run</button></div>
          <section class="obstacle-safety-panel"><h3>Course Overview</h3><canvas id="oc-overview" width="280" height="320" style="width:100%;border:1px solid rgba(238,196,90,.36);border-radius:12px;background:#101914"></canvas><p class="obstacle-safety-small">Yellow = road, green = trees, grey = rocks, blue = stream, gold = collectible.</p></section>
          <button id="hf-export-json" class="obstacle-safety-button" type="button">Download JSON</button>
          <div class="obstacle-safety-metric"><span>Score</span><strong id="oc-score">0</strong></div><div class="obstacle-safety-metric"><span>Collected</span><strong id="oc-collected">0</strong></div><div class="obstacle-safety-metric"><span>Hits</span><strong id="oc-hits">0</strong></div><div class="obstacle-safety-metric"><span>Target</span><strong id="oc-target">20</strong></div><div id="oc-result" class="obstacle-safety-result">Ride waiting. Start the test when ready.</div>
        </aside>
      </div>
    </section>`;

  setupSafetyCourse();
}

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function setupSafetyCourse() {
  const canvas = document.getElementById('oc-canvas');
  const overview = document.getElementById('oc-overview');
  const ctx = canvas.getContext('2d');
  const octx = overview.getContext('2d');
  const state = {
    running: false,
    distance: 0,
    speed: 34,
    targetSpeed: 0,
    currentSpeed: 0,
    duration: 45,
    courseLength: 1530,
    difficulty: 2,
    laneWidth: 2.7,
    x: 0,
    y: 0,
    vy: 0,
    grounded: true,
    score: 0,
    hits: 0,
    collected: 0,
    jumps: 0,
    target: 20,
    keys: new Set(),
    course: [],
    lastTime: performance.now(),
    bg: loadImage(`${ASSET_ROOT}backgrounds/horseridebg.jpg`),
    ground: loadImage(`${ASSET_ROOT}ground/forest_floor_grass2.png`),
    horse: loadImage(`${ASSET_ROOT}foreground/horse.png`)
  };

  function loadImage(src) {
    const img = new Image();
    img.src = `${src}?v=${MODULE_VERSION}`;
    return img;
  }

  function regenerate() {
    state.course = [];
    state.courseLength = Math.max(450, state.duration * state.speed);
    const count = Math.max(18, Math.floor(state.courseLength / 55));
    for (let i = 0; i < count; i += 1) {
      const z = i * 55 + 90;
      const side = (i % 3) - 1;
      const obstacle = Math.random() < 0.22 + state.difficulty * 0.045;
      state.course.push({ z, x: side * 1.8, type: obstacle ? (i % 4 === 0 ? 'stream' : i % 2 ? 'rock' : 'log') : (i % 5 === 0 ? 'collectible' : 'tree'), hit: false, collected: false });
    }
    reset(false);
  }

  function reset(quiet = false) {
    state.running = false;
    state.distance = 0;
    state.currentSpeed = 0;
    state.targetSpeed = 0;
    state.x = 0;
    state.y = 0;
    state.vy = 0;
    state.grounded = true;
    state.score = 0;
    state.hits = 0;
    state.collected = 0;
    state.jumps = 0;
    state.course.forEach((item) => { item.hit = false; item.collected = false; });
    if (!quiet) setResult('Course reset. Start the test when ready.', '');
    updateStats();
  }

  function setResult(message, mode = '') {
    const node = document.getElementById('oc-result');
    node.textContent = message;
    node.dataset.state = mode;
  }

  function updateStats() {
    document.getElementById('oc-score').textContent = String(Math.floor(state.score));
    document.getElementById('oc-collected').textContent = String(state.collected);
    document.getElementById('oc-hits').textContent = String(state.hits);
    document.getElementById('oc-target').textContent = String(state.target);
    document.getElementById('oc-summary').textContent = `${Math.floor(state.distance)}m / ${Math.floor(state.courseLength)}m`;
  }

  function onKey(event, down) {
    const key = event.key.toLowerCase();
    if (['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' ','control'].includes(key)) event.preventDefault();
    if (down) state.keys.add(key); else state.keys.delete(key);
    if (down && key === ' ' && state.grounded) {
      state.vy = 8.2;
      state.grounded = false;
      state.jumps += 1;
    }
  }

  function update(dt) {
    if (!state.running) return;
    const moving = state.keys.has('arrowup') || state.keys.has('w');
    const backing = state.keys.has('arrowdown') || state.keys.has('s');
    state.targetSpeed = moving ? state.speed : backing ? -7 : 0;
    const offPath = Math.abs(state.x) > 2.9;
    if (offPath && state.targetSpeed > 8) state.targetSpeed = 8;
    const rate = Math.abs(state.targetSpeed) > Math.abs(state.currentSpeed) ? 24 : 28;
    state.currentSpeed += clamp(state.targetSpeed - state.currentSpeed, -rate * dt, rate * dt);
    let steer = 0;
    if (state.keys.has('arrowleft') || state.keys.has('a')) steer -= 1;
    if (state.keys.has('arrowright') || state.keys.has('d')) steer += 1;
    state.x = clamp(state.x + steer * 8.5 * dt, -5.6, 5.6);
    state.distance = clamp(state.distance + state.currentSpeed * dt, 0, state.courseLength);
    if (!state.grounded) {
      const holdingJump = state.keys.has(' ') && state.vy > 0;
      state.vy -= (holdingJump ? 8.8 : 14.5) * dt;
      state.y += state.vy * dt;
      if (state.y <= 0) { state.y = 0; state.vy = 0; state.grounded = true; }
    }
    checkObjects();
    state.score += dt * (offPath ? 0.1 : 0.65);
    if (offPath && moving) setResult('Off path: horse slowed to a trot. Steer back onto the road.', 'warn');
    if (state.distance >= state.courseLength) {
      state.running = false;
      setResult(state.score >= state.target ? 'Course complete.' : 'Course complete, but score is below target.', state.score >= state.target ? 'success' : 'failure');
    }
    updateStats();
  }

  function checkObjects() {
    state.course.forEach((item) => {
      const dz = item.z - state.distance;
      if (dz < 5 || dz > 12) return;
      const dx = Math.abs(item.x - state.x);
      if (item.type === 'collectible' && !item.collected && dx < 1.2) {
        item.collected = true;
        state.collected += 1;
        state.score += 5;
        setResult('Collected course marker.', 'success');
      }
      if (['rock','log','stream'].includes(item.type) && !item.hit && dx < 1.1 && state.y < 0.75) {
        item.hit = true;
        state.hits += 1;
        state.score = Math.max(0, state.score - 4);
        setResult(item.type === 'stream' ? 'Stream hit: jump earlier next time.' : 'Obstacle hit.', 'failure');
      }
    });
  }

  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    const bg = state.bg.complete && state.bg.naturalWidth ? state.bg : null;
    if (bg) ctx.drawImage(bg, 0, 0, w, h);
    else {
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#172a38'); sky.addColorStop(0.45, '#203b2a'); sky.addColorStop(1, '#10150c');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    }
    ctx.fillStyle = 'rgba(14,32,16,.72)'; ctx.fillRect(0, h * 0.52, w, h * 0.48);
    drawRoad(ctx, w, h);
    drawObjects(ctx, w, h);
    drawHorse(ctx, w, h);
    drawOverview();
  }

  function drawRoad(target, w, h) {
    target.save();
    target.beginPath();
    target.moveTo(w * 0.44, h);
    target.lineTo(w * 0.50, h * 0.50);
    target.lineTo(w * 0.56, h);
    target.closePath();
    target.fillStyle = '#6b5635'; target.fill();
    target.strokeStyle = 'rgba(238,196,90,.36)'; target.lineWidth = 4; target.stroke();
    target.restore();
  }

  function project(item, w, h) {
    const dz = item.z - state.distance;
    const depth = clamp(dz / 140, 0.02, 1.2);
    const y = h * (0.52 + (1 - depth) * 0.5);
    const x = w * 0.5 + item.x * (1 - depth * 0.55) * 42;
    const scale = clamp(1.3 - depth, 0.1, 1.1);
    return { x, y, scale, visible: dz > -8 && dz < 160 };
  }

  function drawObjects(target, w, h) {
    state.course.forEach((item) => {
      const p = project(item, w, h);
      if (!p.visible) return;
      target.globalAlpha = item.hit || item.collected ? 0.28 : 1;
      if (item.type === 'tree') { target.fillStyle = '#244d27'; target.fillRect(p.x - 10*p.scale, p.y - 45*p.scale, 20*p.scale, 45*p.scale); target.fillStyle = '#2f7a3d'; target.beginPath(); target.arc(p.x, p.y - 55*p.scale, 26*p.scale, 0, Math.PI*2); target.fill(); }
      else if (item.type === 'collectible') { target.fillStyle = '#eec45a'; target.beginPath(); target.arc(p.x, p.y - 18*p.scale, 10*p.scale, 0, Math.PI*2); target.fill(); }
      else if (item.type === 'stream') { target.fillStyle = '#4ca4d8'; target.fillRect(p.x - 48*p.scale, p.y - 8*p.scale, 96*p.scale, 12*p.scale); }
      else { target.fillStyle = item.type === 'log' ? '#7b4d2c' : '#817b6d'; target.fillRect(p.x - 18*p.scale, p.y - 18*p.scale, 36*p.scale, 20*p.scale); }
      target.globalAlpha = 1;
    });
  }

  function drawHorse(target, w, h) {
    const horse = state.horse.complete && state.horse.naturalWidth ? state.horse : null;
    const x = w * 0.5 + state.x * 28;
    const y = h * 0.85 - state.y * 34;
    if (horse) target.drawImage(horse, x - 135, y - 110, 270, 160);
    else {
      target.fillStyle = '#6b3f24'; target.fillRect(x - 58, y - 44, 116, 54);
      target.fillStyle = '#8b5b32'; target.fillRect(x + 24, y - 75, 52, 50);
      target.fillStyle = '#25180f'; target.fillRect(x - 48, y + 4, 14, 52); target.fillRect(x + 34, y + 4, 14, 52);
    }
  }

  function drawOverview() {
    const w = overview.width, h = overview.height;
    octx.clearRect(0,0,w,h);
    octx.fillStyle = '#101914'; octx.fillRect(0,0,w,h);
    octx.strokeStyle = '#eec45a'; octx.lineWidth = 18; octx.beginPath(); octx.moveTo(w/2,h); octx.lineTo(w/2,0); octx.stroke();
    state.course.forEach((item) => {
      const y = h - ((item.z - state.distance + 40) / Math.max(1, state.courseLength)) * h * 8;
      if (y < -10 || y > h + 10) return;
      const x = w/2 + item.x * 10;
      octx.fillStyle = item.type === 'tree' ? '#5aa35e' : item.type === 'collectible' ? '#eec45a' : item.type === 'stream' ? '#4ca4d8' : '#aaa';
      octx.fillRect(x - 3, y - 3, 6, 6);
    });
    octx.fillStyle = '#fff'; octx.beginPath(); octx.arc(w/2 + state.x * 10, h - 28, 6, 0, Math.PI*2); octx.fill();
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - state.lastTime) / 1000 || 0.016);
    state.lastTime = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  document.getElementById('oc-start').addEventListener('click', () => { state.running = true; setResult('Ride started.', 'success'); });
  document.getElementById('oc-pause').addEventListener('click', () => { state.running = false; setResult('Ride paused.', ''); });
  document.getElementById('oc-reset').addEventListener('click', () => reset(false));
  document.getElementById('oc-difficulty').addEventListener('input', (e) => { state.difficulty = Number(e.target.value); document.getElementById('oc-difficulty-out').textContent = String(state.difficulty); regenerate(); });
  document.getElementById('oc-duration').addEventListener('input', (e) => { state.duration = Number(e.target.value); document.getElementById('oc-duration-out').textContent = `${state.duration}s`; regenerate(); });
  document.getElementById('oc-speed').addEventListener('input', (e) => { state.speed = Number(e.target.value); document.getElementById('oc-speed-out').textContent = String(state.speed); regenerate(); });
  document.getElementById('oc-lane').addEventListener('input', (e) => { state.laneWidth = Number(e.target.value); document.getElementById('oc-lane-out').textContent = state.laneWidth.toFixed(1); });
  document.getElementById('hf-export-json').addEventListener('click', () => {
    const payload = { module: 'obstacle-course', version: UI_VERSION, mode: '2d-safety-view', courseLength: state.courseLength, duration: state.duration, difficulty: state.difficulty, objects: state.course };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'obstacle-course-v2-5.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  window.addEventListener('keydown', (e) => onKey(e, true));
  window.addEventListener('keyup', (e) => onKey(e, false));
  regenerate();
  requestAnimationFrame(loop);
}

bootObstacleCourse();
