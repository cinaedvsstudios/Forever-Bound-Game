const W = 1280;
const H = 720;
const FX_SCALE = 0.62;

const canvas = document.getElementById('preview');
const ctx = canvas.getContext('2d', { alpha: false });
const fxCanvas = document.createElement('canvas');
fxCanvas.width = Math.round(W * FX_SCALE);
fxCanvas.height = Math.round(H * FX_SCALE);
const fx = fxCanvas.getContext('2d', { alpha: true });

const state = {
  playing: true,
  time: 0,
  last: performance.now(),
  fpsFrames: 0,
  fpsTime: 0,
  scene: 'forest-gate',
  mode: 'rising',
  layer: 'front',
  doubleLayer: true,
  colour: '#dce2e7',
  mistOpacity: 0.36,
  density: 0.86,
  puffSize: 1.73,
  definition: 0.82,
  wispCount: 13,
  wispBrightness: 0.09,
  wispLength: 0.95,
  wispWidth: 0.42,
  tailFade: 0.98,
  curl: 0.94,
  rotation: 0.91,
  duration: 8.6,
  rise: 0.31,
  drift: 0.13,
  turbulence: 0.54,
  clear: 0.54,
  edge: 0.64,
  bias: 0,
  sourceX: 50,
  sourceY: 76,
  sourceWidth: 34,
  height: 400,
  showMarker: true,
  instances: [],
  brush: null
};

const input = {
  type: byId('effect-type'), mode: byId('mode'), scene: byId('scene'), layer: byId('layer'), doubleLayer: byId('double-layer'), colour: byId('colour'), colourHex: byId('colour-hex'),
  mistOpacity: byId('mist-opacity'), density: byId('density'), puffSize: byId('puff-size'), definition: byId('definition'),
  wispCount: byId('wisp-count'), wispBrightness: byId('wisp-brightness'), wispLength: byId('wisp-length'), wispWidth: byId('wisp-width'), tailFade: byId('tail-fade'), curl: byId('curl'), rotation: byId('rotation'), duration: byId('duration'),
  rise: byId('rise'), drift: byId('drift'), turbulence: byId('turbulence'), clear: byId('clear'), edge: byId('edge'), bias: byId('bias'),
  sourceX: byId('source-x'), sourceY: byId('source-y'), sourceWidth: byId('source-width'), height: byId('height'), showMarker: byId('show-marker')
};

const out = Object.fromEntries(['mist-opacity','density','puff-size','definition','wisp-count','wisp-brightness','wisp-length','wisp-width','tail-fade','curl','rotation','duration','rise','drift','turbulence','clear','edge','bias','source-x','source-y','source-width','height'].map((key) => [key, byId(`${key}-out`)]));

init();

function init() {
  bind();
  resizeCanvas();
  regenerate();
  updateUi();
  window.addEventListener('resize', resizeCanvas);
  requestAnimationFrame(frame);
}

function bind() {
  input.type.addEventListener('change', () => { if (input.type.value !== './index.html') window.location.href = input.type.value; });
  input.mode.addEventListener('change', () => { state.mode = input.mode.value; regenerate(); updateUi(); });
  input.scene.addEventListener('change', () => { state.scene = input.scene.value; updateJson(); });
  input.layer.addEventListener('change', () => { state.layer = input.layer.value; updateJson(); });
  input.doubleLayer.addEventListener('change', () => { state.doubleLayer = input.doubleLayer.checked; regenerate(); toast(state.doubleLayer ? 'Double layer preview enabled.' : 'Single layer preview enabled.'); });
  input.colour.addEventListener('input', () => { state.colour = input.colour.value; input.colourHex.value = state.colour; buildBrush(); updateJson(); });
  input.colourHex.addEventListener('change', () => { state.colour = normalHex(input.colourHex.value, state.colour); input.colour.value = state.colour; input.colourHex.value = state.colour; buildBrush(); updateJson(); });
  bindNumber('mistOpacity', false); bindNumber('density', true); bindNumber('puffSize', true); bindNumber('definition', true);
  bindNumber('wispCount', true); bindNumber('wispBrightness', false); bindNumber('wispLength', true); bindNumber('wispWidth', true); bindNumber('tailFade', false); bindNumber('curl', false); bindNumber('rotation', false); bindNumber('duration', true);
  bindNumber('rise', false); bindNumber('drift', false); bindNumber('turbulence', false); bindNumber('clear', false); bindNumber('edge', true); bindNumber('bias', true);
  bindNumber('sourceX', true); bindNumber('sourceY', true); bindNumber('sourceWidth', true); bindNumber('height', true);
  input.showMarker.addEventListener('change', () => { state.showMarker = input.showMarker.checked; updateJson(); });
  byId('regenerate').addEventListener('click', () => { regenerate(); toast('New smoke forms generated.'); });
  byId('toggle-play').addEventListener('click', () => { state.playing = !state.playing; byId('toggle-play').textContent = state.playing ? '⏸' : '▶'; byId('toggle-play').classList.toggle('active', state.playing); });
  byId('reset-time').addEventListener('click', () => { state.time = 0; regenerate(); toast('Smoke reset.'); });
  byId('snapshot').addEventListener('click', snapshot);
  byId('copy-json').addEventListener('click', copyJson);
}

function bindNumber(property, regenerateForms) {
  input[property].addEventListener('input', () => {
    state[property] = Number(input[property].value);
    updateOutputs();
    if (regenerateForms) regenerate(); else updateJson();
  });
}

function updateUi() {
  byId('vignette-controls').hidden = state.mode !== 'vignette';
  byId('emission-controls').hidden = state.mode !== 'emission';
  const labels = {
    rising: 'rising smoke body · subtle smooth internal ribbons',
    wispy: 'wispy / incense smoke · continuous forming and dissolving curves',
    vignette: 'smoke vignette · transparent centre over the scene',
    fullscreen: 'full screen drifting smoke field',
    emission: 'emission point · chimney, incense or fire plume'
  };
  byId('stage-description').textContent = labels[state.mode];
  updateOutputs();
  updateJson();
}

function updateOutputs() {
  out['mist-opacity'].textContent = state.mistOpacity.toFixed(2); out.density.textContent = state.density.toFixed(2); out['puff-size'].textContent = state.puffSize.toFixed(2); out.definition.textContent = state.definition.toFixed(2);
  out['wisp-count'].textContent = String(state.wispCount); out['wisp-brightness'].textContent = state.wispBrightness.toFixed(2); out['wisp-length'].textContent = state.wispLength.toFixed(2); out['wisp-width'].textContent = state.wispWidth.toFixed(2); out['tail-fade'].textContent = state.tailFade.toFixed(2); out.curl.textContent = state.curl.toFixed(2); out.rotation.textContent = state.rotation.toFixed(2); out.duration.textContent = `${state.duration.toFixed(2)}s`;
  out.rise.textContent = state.rise.toFixed(2); out.drift.textContent = state.drift.toFixed(2); out.turbulence.textContent = state.turbulence.toFixed(2); out.clear.textContent = state.clear.toFixed(2); out.edge.textContent = state.edge.toFixed(2); out.bias.textContent = state.bias.toFixed(2);
  out['source-x'].textContent = `${state.sourceX}%`; out['source-y'].textContent = `${state.sourceY}%`; out['source-width'].textContent = `${state.sourceWidth}px`; out.height.textContent = `${state.height}px`;
}

function regenerate() {
  buildBrush();
  state.instances = [];
  const passes = state.doubleLayer ? 2 : 1;
  for (let pass = 0; pass < passes; pass += 1) {
    const rand = seeded(Math.floor(Math.random() * 10000000));
    const instance = {
      puffs: [],
      ribbons: [],
      alpha: pass === 0 ? 1 : 0.82,
      phase: pass === 0 ? 0 : 1.73,
      shiftX: pass === 0 ? 0 : 8,
      shiftY: pass === 0 ? 0 : -5
    };
    const basePuffs = { rising: 9, wispy: 2, vignette: 18, fullscreen: 22, emission: 6 }[state.mode] || 8;
    const puffCount = Math.min(34, Math.round(basePuffs + state.density * (state.mode === 'wispy' ? 5 : 12)));
    for (let index = 0; index < puffCount; index += 1) instance.puffs.push(makePuff(rand, true));
    const ribbonCount = {
      rising: Math.min(3, Math.round(state.wispCount * 0.45)),
      wispy: state.wispCount,
      vignette: Math.min(2, Math.round(state.wispCount * 0.22)),
      fullscreen: Math.min(2, Math.round(state.wispCount * 0.2)),
      emission: Math.max(1, Math.round(state.wispCount * 0.58))
    }[state.mode] || 0;
    for (let index = 0; index < ribbonCount; index += 1) instance.ribbons.push(makeRibbon(rand, true));
    state.instances.push(instance);
  }
  updateJson();
}

function makePuff(rand, initial) {
  const puff = {
    age: initial ? rand() : 0,
    life: 4.8 + rand() * 5.4,
    radius: (76 + rand() * 138) * state.puffSize,
    phase: rand() * Math.PI * 2,
    spin: (rand() - 0.5) * 0.12,
    alpha: 0.20 + rand() * 0.30
  };
  positionForMode(puff, rand, false);
  return puff;
}

function makeRibbon(rand, initial) {
  const ribbon = {
    age: initial ? rand() : 0,
    life: state.duration * (0.78 + rand() * 0.42),
    phase: rand() * Math.PI * 2,
    angle: selectRibbonAngle(rand),
    swayA: (22 + rand() * 44) * (0.35 + state.curl),
    swayB: (18 + rand() * 62) * (0.35 + state.curl),
    turnA: rand() > 0.5 ? 1 : -1,
    turnB: rand() > 0.5 ? 1 : -1,
    foldSpeed: 0.45 + rand() * 0.92,
    width: (3.5 + rand() * 7.5) * (0.32 + state.wispWidth),
    maxLength: (180 + rand() * 320) * state.wispLength,
    alpha: 0.48 + rand() * 0.42
  };
  positionForMode(ribbon, rand, true);
  return ribbon;
}

function selectRibbonAngle(rand) {
  if (state.mode === 'wispy') return -Math.PI + rand() * Math.PI * 0.94;
  if (state.mode === 'vignette' || state.mode === 'fullscreen') return -Math.PI + rand() * Math.PI * 2;
  return -Math.PI / 2 + (rand() - 0.5) * 0.55;
}

function positionForMode(item, rand, ribbon) {
  if (state.mode === 'emission') {
    item.x = W * state.sourceX / 100 + (rand() - 0.5) * state.sourceWidth;
    item.y = H * state.sourceY / 100;
    item.plume = state.height * (0.74 + rand() * 0.28);
  } else if (state.mode === 'vignette') {
    const side = Math.floor(rand() * 4);
    if (side === 0) { item.x = rand() * W; item.y = rand() * 102; }
    if (side === 1) { item.x = rand() * W; item.y = H - rand() * 102; }
    if (side === 2) { item.x = rand() * 108; item.y = rand() * H; }
    if (side === 3) { item.x = W - rand() * 108; item.y = rand() * H; }
    item.y += state.bias * 82;
  } else if (state.mode === 'fullscreen') {
    item.x = rand() * W;
    item.y = rand() * H;
  } else if (state.mode === 'wispy' && ribbon) {
    item.x = W * (0.10 + rand() * 0.80);
    item.y = H * (0.22 + rand() * 0.66);
    item.plume = 230 + rand() * 370;
  } else {
    item.x = W * (0.12 + rand() * 0.76);
    item.y = H * (0.62 + rand() * 0.29);
    item.plume = 250 + rand() * 320;
  }
  item.originX = item.x;
  item.originY = item.y;
}

function buildBrush() {
  const brush = document.createElement('canvas');
  brush.width = 224;
  brush.height = 224;
  const g = brush.getContext('2d');
  const rand = seeded(Math.floor(Math.random() * 10000000));
  for (let index = 0; index < 12; index += 1) {
    const x = 42 + rand() * 140;
    const y = 38 + rand() * 148;
    const radius = 40 + rand() * 66;
    const gradient = g.createRadialGradient(x, y, 1, x, y, radius);
    const alpha = 0.018 + rand() * (0.028 + state.definition * 0.032);
    gradient.addColorStop(0, rgba(state.colour, alpha));
    gradient.addColorStop(0.40, rgba(state.colour, alpha * 0.68));
    gradient.addColorStop(1, rgba(state.colour, 0));
    g.fillStyle = gradient;
    g.beginPath();
    g.ellipse(x, y, radius, radius * (0.55 + rand() * 0.34), rand() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  state.brush = brush;
}

function frame(now) {
  const delta = Math.min(0.05, (now - state.last) / 1000);
  state.last = now;
  if (state.playing) {
    state.time += delta;
    updateForms(delta);
  }
  draw();
  updateFps(delta);
  requestAnimationFrame(frame);
}

function updateForms(delta) {
  for (const instance of state.instances) {
    for (let index = 0; index < instance.puffs.length; index += 1) {
      instance.puffs[index].age += delta / instance.puffs[index].life;
      if (instance.puffs[index].age >= 1) instance.puffs[index] = makePuff(Math.random, false);
    }
    for (let index = 0; index < instance.ribbons.length; index += 1) {
      instance.ribbons[index].age += delta / instance.ribbons[index].life;
      if (instance.ribbons[index].age >= 1) instance.ribbons[index] = makeRibbon(Math.random, false);
    }
  }
}

function updateFps(delta) {
  state.fpsFrames += 1;
  state.fpsTime += delta;
  if (state.fpsTime >= 0.55) {
    byId('fps').textContent = `FPS: ${Math.round(state.fpsFrames / state.fpsTime)}`;
    state.fpsFrames = 0;
    state.fpsTime = 0;
  }
}

function draw() {
  const fit = fitStage(canvas.width, canvas.height);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#020203';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(fit.x, fit.y);
  ctx.scale(fit.scale, fit.scale);
  drawSceneBase(ctx, state.scene);
  if (state.layer === 'back') compositeSmoke(ctx);
  drawStructures(ctx, state.scene);
  if (state.layer === 'mid') compositeSmoke(ctx);
  drawFigures(ctx, state.scene);
  if (state.layer === 'front') compositeSmoke(ctx);
  if (state.mode === 'emission' && state.showMarker) drawMarker(ctx);
  vignette(ctx);
  ctx.restore();
}

function compositeSmoke(context) {
  fx.setTransform(1, 0, 0, 1, 0, 0);
  fx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
  fx.save();
  fx.scale(FX_SCALE, FX_SCALE);
  for (const instance of state.instances) {
    fx.save();
    fx.translate(instance.shiftX, instance.shiftY);
    drawPuffs(fx, instance);
    drawRibbons(fx, instance);
    fx.restore();
  }
  if (state.mode === 'vignette') cutTransparentCentre(fx);
  fx.restore();
  context.save();
  context.globalCompositeOperation = 'screen';
  context.imageSmoothingEnabled = true;
  context.drawImage(fxCanvas, 0, 0, W, H);
  context.restore();
}

function drawPuffs(context, instance) {
  const modeAlpha = state.mode === 'wispy' ? 0.36 : state.mode === 'rising' ? 0.65 : 1;
  context.save();
  context.globalCompositeOperation = 'screen';
  for (const puff of instance.puffs) {
    const fade = smoothEnvelope(puff.age, 0.18, 0.32);
    let x = puff.originX + state.drift * puff.age * 116 + Math.sin(puff.phase + instance.phase + state.time * 0.36) * state.turbulence * 17;
    let y = puff.originY;
    if (state.mode === 'rising' || state.mode === 'wispy' || state.mode === 'emission') y -= puff.age * (puff.plume || 330) * (0.45 + state.rise * 0.72);
    else y += Math.sin(state.time * 0.23 + instance.phase + puff.phase) * state.turbulence * 10;
    const radius = puff.radius * (0.82 + puff.age * 0.72);
    context.save();
    context.translate(x, y);
    context.rotate(puff.spin * (state.time + instance.phase));
    context.globalAlpha = state.mistOpacity * puff.alpha * fade * modeAlpha * instance.alpha;
    context.drawImage(state.brush, -radius / 2, -radius / 2, radius, radius);
    context.restore();
  }
  context.restore();
}

function drawRibbons(context, instance) {
  if (!instance.ribbons.length) return;
  context.save();
  context.globalCompositeOperation = 'screen';
  context.lineCap = 'round';
  context.lineJoin = 'round';
  for (const ribbon of instance.ribbons) {
    const growth = easeOutCubic(clamp(ribbon.age / 0.42, 0, 1));
    const lifeFade = smoothEnvelope(ribbon.age, 0.12, 0.30);
    const length = ribbon.maxLength * growth;
    if (length < 3 || lifeFade <= 0) continue;
    const geometry = makeRibbonPath(ribbon, length, instance.phase);
    const brightness = ribbon.alpha * state.wispBrightness * lifeFade * instance.alpha;
    const gradient = context.createLinearGradient(geometry.start.x, geometry.start.y, geometry.end.x, geometry.end.y);
    const fadeSpan = 0.12 + state.tailFade * 0.10;
    gradient.addColorStop(0, rgba(state.colour, 0));
    gradient.addColorStop(fadeSpan, rgba(state.colour, brightness * 0.54));
    gradient.addColorStop(0.42, rgba(state.colour, brightness));
    gradient.addColorStop(0.72, rgba(state.colour, brightness * 0.68));
    gradient.addColorStop(1, rgba(state.colour, 0));
    context.save();
    context.strokeStyle = gradient;
    context.globalAlpha = 0.20;
    context.lineWidth = ribbon.width * (8.2 + state.wispWidth * 3.6);
    context.filter = 'blur(5px)';
    context.stroke(geometry.path);
    context.restore();
    context.save();
    context.strokeStyle = gradient;
    context.globalAlpha = 0.57;
    context.lineWidth = ribbon.width * (2.4 + state.wispWidth * 1.5);
    context.filter = 'blur(1.3px)';
    context.stroke(geometry.path);
    context.restore();
    context.save();
    context.strokeStyle = gradient;
    context.globalAlpha = 0.48 + state.definition * 0.25;
    context.lineWidth = Math.max(0.7, ribbon.width * (0.44 + state.wispWidth * 0.32));
    context.stroke(geometry.path);
    context.restore();
  }
  context.restore();
}

function makeRibbonPath(ribbon, length, phaseOffset) {
  const motion = (state.time + phaseOffset) * (0.34 + state.rotation * ribbon.foldSpeed);
  const turn = Math.sin(ribbon.phase + motion * 0.38) * state.rotation * 0.46;
  const angle = ribbon.angle + turn;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const nx = -dy;
  const ny = dx;
  const baseDrift = state.drift * ribbon.age * length * 0.33;
  const baseWave = Math.sin(ribbon.phase + (state.time + phaseOffset) * 0.30) * state.turbulence * 9;
  const start = { x: ribbon.originX + baseDrift + nx * baseWave, y: ribbon.originY + ny * baseWave };
  const side1 = Math.sin(ribbon.phase + motion) * ribbon.swayA * ribbon.turnA;
  const side2 = Math.sin(ribbon.phase * 1.4 - motion * 0.72) * ribbon.swayB * ribbon.turnB;
  const side3 = Math.cos(ribbon.phase * 0.8 + motion * 1.05) * (ribbon.swayA * 0.74);
  const a = pointAlong(start, dx, dy, nx, ny, length * 0.32, side1);
  const b = pointAlong(start, dx, dy, nx, ny, length * 0.67, side2);
  const end = pointAlong(start, dx, dy, nx, ny, length, side3);
  const c1 = pointAlong(start, dx, dy, nx, ny, length * 0.12, side1 * 0.48);
  const c2 = pointAlong(a, dx, dy, nx, ny, -length * 0.09, side1 * 0.18);
  const c3 = pointAlong(a, dx, dy, nx, ny, length * 0.11, side2 * 0.26);
  const c4 = pointAlong(b, dx, dy, nx, ny, -length * 0.12, side2 * 0.20);
  const c5 = pointAlong(b, dx, dy, nx, ny, length * 0.12, side3 * 0.30);
  const c6 = pointAlong(end, dx, dy, nx, ny, -length * 0.11, side3 * 0.08);
  const path = new Path2D();
  path.moveTo(start.x, start.y);
  path.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, a.x, a.y);
  path.bezierCurveTo(c3.x, c3.y, c4.x, c4.y, b.x, b.y);
  path.bezierCurveTo(c5.x, c5.y, c6.x, c6.y, end.x, end.y);
  return { path, start, end };
}

function pointAlong(origin, dx, dy, nx, ny, longitudinal, sideways) {
  return { x: origin.x + dx * longitudinal + nx * sideways, y: origin.y + dy * longitudinal + ny * sideways };
}

function cutTransparentCentre(context) {
  const centreX = W / 2;
  const centreY = H / 2 + state.bias * 92;
  const inner = H * state.clear * 0.46;
  const outer = inner + 80 + state.edge * 180;
  context.save();
  context.globalCompositeOperation = 'destination-out';
  const mask = context.createRadialGradient(centreX, centreY, inner, centreX, centreY, outer);
  mask.addColorStop(0, 'rgba(0,0,0,1)');
  mask.addColorStop(0.67, 'rgba(0,0,0,0.97)');
  mask.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = mask;
  context.fillRect(0, 0, W, H);
  context.restore();
}

function drawSceneBase(context, scene) {
  if (scene === 'transparent-check') { checker(context); return; }
  const colours = palette(scene);
  const gradient = context.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, colours.skyTop);
  gradient.addColorStop(0.64, colours.skyBottom);
  gradient.addColorStop(1, colours.ground);
  context.fillStyle = gradient;
  context.fillRect(0, 0, W, H);
  context.globalAlpha = 0.45;
  context.fillStyle = colours.moon;
  context.beginPath();
  context.arc(940, 124, scene === 'underworld' ? 84 : 54, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;
  context.fillStyle = colours.far;
  context.beginPath();
  context.moveTo(0, 425);
  for (let x = 0; x <= W; x += 110) context.lineTo(x, 354 + Math.sin(x * 0.015) * 25);
  context.lineTo(W, H);
  context.lineTo(0, H);
  context.fill();
  context.fillStyle = colours.ground;
  context.fillRect(0, 512, W, 208);
}

function drawStructures(context, scene) {
  if (scene === 'transparent-check') return;
  const colours = palette(scene);
  context.fillStyle = colours.tree;
  for (const [x, top, size] of [[95,190,60],[183,168,68],[1060,180,63],[1162,214,52]]) {
    context.fillRect(x + size * 0.42, top + 95, size * 0.18, 280);
    for (let index = 0; index < 4; index += 1) {
      context.beginPath();
      context.moveTo(x + size / 2, top + index * 43);
      context.lineTo(x - index * 7, top + 117 + index * 45);
      context.lineTo(x + size + index * 7, top + 117 + index * 45);
      context.fill();
    }
  }
  context.fillStyle = colours.wall;
  context.fillRect(500, 167, 282, 393);
  context.fillRect(472, 204, 30, 356);
  context.fillRect(780, 204, 31, 356);
  context.fillStyle = colours.edge;
  context.fillRect(490, 185, 301, 22);
  context.fillRect(465, 200, 42, 17);
  context.fillRect(776, 200, 43, 17);
  context.fillStyle = colours.door;
  context.beginPath();
  context.ellipse(641, 420, 74, 128, 0, Math.PI, 0);
  context.lineTo(715, 560);
  context.lineTo(567, 560);
  context.fill();
}

function drawFigures(context, scene) {
  if (scene === 'transparent-check') return;
  figure(context, 566, 516, 0.9);
  figure(context, 735, 506, 1.03);
}

function figure(context, x, y, scale) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.fillStyle = '#24141f';
  context.beginPath();
  context.arc(0, -68, 15, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.moveTo(-18, -51);
  context.lineTo(-37, 67);
  context.lineTo(35, 67);
  context.lineTo(18, -51);
  context.fill();
  context.restore();
}

function drawMarker(context) {
  const x = W * state.sourceX / 100;
  const y = H * state.sourceY / 100;
  context.save();
  context.strokeStyle = '#27d7ff';
  context.lineWidth = 2;
  context.beginPath();
  context.arc(x, y, Math.max(9, state.sourceWidth / 2), 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.moveTo(x - 18, y); context.lineTo(x + 18, y);
  context.moveTo(x, y - 18); context.lineTo(x, y + 18);
  context.stroke();
  context.restore();
}

function vignette(context) {
  const gradient = context.createRadialGradient(W / 2, H / 2, W * 0.26, W / 2, H / 2, W * 0.66);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,.58)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, W, H);
}

function checker(context) {
  for (let y = 0; y < H; y += 48) {
    for (let x = 0; x < W; x += 48) {
      context.fillStyle = ((x / 48 + y / 48) % 2 === 0) ? '#2b2627' : '#171416';
      context.fillRect(x, y, 48, 48);
    }
  }
}

function palette(scene) {
  const palettes = {
    'forest-gate': { skyTop:'#080e13', skyBottom:'#17231f', ground:'#090d0b', far:'#101813', moon:'#b4c7d2', tree:'#080b08', wall:'#241a13', edge:'#483326', door:'#050706' },
    'ruined-road': { skyTop:'#100b11', skyBottom:'#2a201b', ground:'#15100e', far:'#1c1613', moon:'#d4bb91', tree:'#100c0c', wall:'#3a2f24', edge:'#745739', door:'#0b0808' },
    underworld: { skyTop:'#050307', skyBottom:'#18091c', ground:'#080409', far:'#0b060f', moon:'#573265', tree:'#070409', wall:'#161018', edge:'#392142', door:'#010203' }
  };
  return palettes[scene] || palettes['forest-gate'];
}

function updateJson() {
  const data = {
    engine: 'smoke',
    status: 'debug-prototype-not-runtime-schema',
    mode: state.mode,
    previewLayer: state.layer,
    previewCopies: state.doubleLayer ? 2 : 1,
    performance: { reducedBufferScale: FX_SCALE },
    mistBody: { colour: state.colour, opacity: state.mistOpacity, density: state.density, size: state.puffSize, definition: state.definition },
    ribbonWisps: { renderer: 'continuous-cubic-ribbon', independentFromMistOpacity: true, count: state.wispCount, brightness: state.wispBrightness, maximumLength: state.wispLength, width: state.wispWidth, endFade: state.tailFade, curl: state.curl, rotationalFold: state.rotation, formDurationSeconds: state.duration },
    movement: { riseSpeed: state.rise, driftSpeed: state.drift, turbulence: state.turbulence },
    vignette: { centreOpening: state.clear, edgeDepth: state.edge, verticalBias: state.bias },
    emission: { xPercent: state.sourceX, yPercent: state.sourceY, sourceWidth: state.sourceWidth, plumeHeight: state.height }
  };
  byId('json-output').textContent = JSON.stringify(data, null, 2);
}

function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.max(640, Math.round(bounds.width * ratio));
  canvas.height = Math.max(360, Math.round(bounds.height * ratio));
}

function fitStage(width, height) {
  const scale = Math.min(width / W, height / H);
  return { scale, x: (width - W * scale) / 2, y: (height - H * scale) / 2 };
}

function smoothEnvelope(time, fadeIn, fadeOut) {
  return clamp(Math.min(1, time / fadeIn) * Math.min(1, (1 - time) / fadeOut), 0, 1);
}

function easeOutCubic(value) { return 1 - Math.pow(1 - value, 3); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function normalHex(value, fallback) { return /^#[0-9a-f]{6}$/i.test(String(value).trim()) ? String(value).trim().toLowerCase() : fallback; }
function rgba(hex, alpha) { const value = normalHex(hex, '#ffffff').slice(1); return `rgba(${parseInt(value.slice(0,2),16)}, ${parseInt(value.slice(2,4),16)}, ${parseInt(value.slice(4,6),16)}, ${clamp(alpha,0,1)})`; }
function seeded(seed) { let value = seed >>> 0; return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; }; }
function byId(id) { return document.getElementById(id); }
function snapshot() { const link = document.createElement('a'); link.download = `smoke-engine-${state.mode}.png`; link.href = canvas.toDataURL('image/png'); link.click(); }
async function copyJson() { try { await navigator.clipboard.writeText(byId('json-output').textContent); toast('Smoke settings copied.'); } catch (error) { toast('Copy unavailable; use the JSON panel.'); } }
let toastTimer;
function toast(text) { const element = byId('toast'); element.textContent = text; element.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => element.classList.remove('visible'), 2200); }
