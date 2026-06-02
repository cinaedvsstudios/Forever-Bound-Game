const W = 1280;
const H = 720;
const FX_SCALE = 0.46;

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
  mode: 'wispy',
  layer: 'front',
  colour: '#dce2e7',
  opacity: 0.52,
  density: 0.40,
  puffSize: 0.78,
  definition: 0.55,
  wispCount: 7,
  wispBrightness: 0.72,
  wispLength: 0.67,
  wispWidth: 0.44,
  tailFade: 0.74,
  curl: 0.69,
  rotation: 0.61,
  duration: 5.2,
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
  puffs: [],
  ribbons: [],
  brush: null
};

const input = {
  type: byId('effect-type'), mode: byId('mode'), scene: byId('scene'), layer: byId('layer'), colour: byId('colour'), colourHex: byId('colour-hex'),
  opacity: byId('opacity'), density: byId('density'), puffSize: byId('puff-size'), definition: byId('definition'),
  wispCount: byId('wisp-count'), wispBrightness: byId('wisp-brightness'), wispLength: byId('wisp-length'), wispWidth: byId('wisp-width'), tailFade: byId('tail-fade'), curl: byId('curl'), rotation: byId('rotation'), duration: byId('duration'),
  rise: byId('rise'), drift: byId('drift'), turbulence: byId('turbulence'), clear: byId('clear'), edge: byId('edge'), bias: byId('bias'),
  sourceX: byId('source-x'), sourceY: byId('source-y'), sourceWidth: byId('source-width'), height: byId('height'), showMarker: byId('show-marker')
};

const out = Object.fromEntries(['opacity','density','puff-size','definition','wisp-count','wisp-brightness','wisp-length','wisp-width','tail-fade','curl','rotation','duration','rise','drift','turbulence','clear','edge','bias','source-x','source-y','source-width','height'].map((key) => [key, byId(`${key}-out`)]));

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
  input.colour.addEventListener('input', () => { state.colour = input.colour.value; input.colourHex.value = state.colour; buildBrush(); updateJson(); });
  input.colourHex.addEventListener('change', () => { state.colour = normalHex(input.colourHex.value, state.colour); input.colour.value = state.colour; input.colourHex.value = state.colour; buildBrush(); updateJson(); });

  bindFloat('opacity', 'opacity', false); bindFloat('density', 'density', true); bindFloat('puffSize', 'puff-size', true); bindFloat('definition', 'definition', true);
  bindInt('wispCount', 'wisp-count', true); bindFloat('wispBrightness', 'wisp-brightness', false); bindFloat('wispLength', 'wisp-length', true); bindFloat('wispWidth', 'wisp-width', true); bindFloat('tailFade', 'tail-fade', false); bindFloat('curl', 'curl', false); bindFloat('rotation', 'rotation', false); bindFloat('duration', 'duration', true);
  bindFloat('rise', 'rise', false); bindFloat('drift', 'drift', false); bindFloat('turbulence', 'turbulence', false); bindFloat('clear', 'clear', false); bindFloat('edge', 'edge', true); bindFloat('bias', 'bias', true);
  bindInt('sourceX', 'source-x', true); bindInt('sourceY', 'source-y', true); bindInt('sourceWidth', 'source-width', true); bindInt('height', 'height', true);
  input.showMarker.addEventListener('change', () => { state.showMarker = input.showMarker.checked; updateJson(); });
  byId('regenerate').addEventListener('click', () => { regenerate(); toast('New smoke forms generated.'); });
  byId('toggle-play').addEventListener('click', () => { state.playing = !state.playing; byId('toggle-play').textContent = state.playing ? '⏸' : '▶'; byId('toggle-play').classList.toggle('active', state.playing); });
  byId('reset-time').addEventListener('click', () => { state.time = 0; regenerate(); toast('Smoke reset.'); });
  byId('snapshot').addEventListener('click', snapshot);
  byId('copy-json').addEventListener('click', copyJson);
}

function bindFloat(property, id, regen) {
  input[property].addEventListener('input', () => { state[property] = Number(input[property].value); updateOutputs(); if (regen) regenerate(); else updateJson(); });
}
function bindInt(property, id, regen) {
  input[property].addEventListener('input', () => { state[property] = Number(input[property].value); updateOutputs(); if (regen) regenerate(); else updateJson(); });
}

function updateUi() {
  byId('vignette-controls').hidden = state.mode !== 'vignette';
  byId('emission-controls').hidden = state.mode !== 'emission';
  const labels = {
    rising: 'rising smoke body · soft plumes with faint inner folds',
    wispy: 'wispy / incense ribbons · forming, twisting and dissolving trails',
    vignette: 'smoke vignette · transparent centre over the scene',
    fullscreen: 'full screen drifting smoke field',
    emission: 'emission point · chimney, incense or fire plume'
  };
  byId('stage-description').textContent = labels[state.mode];
  updateOutputs();
  updateJson();
}

function updateOutputs() {
  out.opacity.textContent = state.opacity.toFixed(2); out.density.textContent = state.density.toFixed(2); out['puff-size'].textContent = state.puffSize.toFixed(2); out.definition.textContent = state.definition.toFixed(2);
  out['wisp-count'].textContent = String(state.wispCount); out['wisp-brightness'].textContent = state.wispBrightness.toFixed(2); out['wisp-length'].textContent = state.wispLength.toFixed(2); out['wisp-width'].textContent = state.wispWidth.toFixed(2); out['tail-fade'].textContent = state.tailFade.toFixed(2); out.curl.textContent = state.curl.toFixed(2); out.rotation.textContent = state.rotation.toFixed(2); out.duration.textContent = `${state.duration.toFixed(2)}s`;
  out.rise.textContent = state.rise.toFixed(2); out.drift.textContent = state.drift.toFixed(2); out.turbulence.textContent = state.turbulence.toFixed(2); out.clear.textContent = state.clear.toFixed(2); out.edge.textContent = state.edge.toFixed(2); out.bias.textContent = state.bias.toFixed(2);
  out['source-x'].textContent = `${state.sourceX}%`; out['source-y'].textContent = `${state.sourceY}%`; out['source-width'].textContent = `${state.sourceWidth}px`; out.height.textContent = `${state.height}px`;
}

function regenerate() {
  const rand = seeded(Math.floor(Math.random() * 10000000));
  buildBrush();
  state.puffs = [];
  state.ribbons = [];
  const puffBase = { rising: 16, wispy: 10, vignette: 26, fullscreen: 28, emission: 10 }[state.mode];
  const puffs = Math.min(46, Math.round(puffBase + state.density * 17));
  for (let i = 0; i < puffs; i += 1) state.puffs.push(makePuff(rand, true));
  const ribbonAmount = state.mode === 'wispy' || state.mode === 'emission' || state.mode === 'rising' ? state.wispCount : Math.round(state.wispCount * 0.28);
  for (let i = 0; i < ribbonAmount; i += 1) state.ribbons.push(makeRibbon(rand, true));
  updateJson();
}

function makePuff(rand, initial) {
  const p = { age: initial ? rand() : 0, life: 3.8 + rand() * 4.8, radius: (44 + rand() * 105) * state.puffSize, phase: rand() * Math.PI * 2, spin: (rand() - 0.5) * 0.22, alpha: 0.38 + rand() * 0.48 };
  positionForMode(p, rand);
  return p;
}
function makeRibbon(rand, initial) {
  const r = { age: initial ? rand() : 0, life: state.duration * (0.75 + rand() * 0.5), phase: rand() * Math.PI * 2, sway: (25 + rand() * 70) * (0.35 + state.curl), tilt: (rand() - 0.5) * 1.2, turns: 1.4 + rand() * 2.8, width: (4 + rand() * 11) * (0.3 + state.wispWidth), maxLength: (130 + rand() * 290) * state.wispLength, alpha: 0.45 + rand() * 0.55, direction: rand() > 0.5 ? 1 : -1 };
  positionForMode(r, rand);
  return r;
}
function positionForMode(item, rand) {
  if (state.mode === 'emission') {
    item.x = W * state.sourceX / 100 + (rand() - 0.5) * state.sourceWidth;
    item.y = H * state.sourceY / 100;
    item.plume = state.height * (0.72 + rand() * 0.34);
  } else if (state.mode === 'vignette') {
    const side = Math.floor(rand() * 4);
    if (side === 0) { item.x = rand() * W; item.y = rand() * 130; }
    if (side === 1) { item.x = rand() * W; item.y = H - rand() * 130; }
    if (side === 2) { item.x = rand() * 125; item.y = rand() * H; }
    if (side === 3) { item.x = W - rand() * 125; item.y = rand() * H; }
    item.y += state.bias * 82;
  } else if (state.mode === 'fullscreen') {
    item.x = rand() * W; item.y = rand() * H;
  } else {
    item.x = W * (0.12 + rand() * 0.76); item.y = H * (0.58 + rand() * 0.33);
    item.plume = 260 + rand() * 340;
  }
  item.originX = item.x; item.originY = item.y;
}

function buildBrush() {
  const brush = document.createElement('canvas');
  brush.width = 192; brush.height = 192;
  const b = brush.getContext('2d');
  const rand = seeded(Math.floor(Math.random() * 10000000));
  for (let i = 0; i < 18; i += 1) {
    const x = 34 + rand() * 124, y = 30 + rand() * 132, rx = 18 + rand() * 52, ry = rx * (0.44 + rand() * 0.45);
    const g = b.createRadialGradient(x, y, 1, x, y, rx);
    const a = 0.028 + rand() * (0.054 + state.definition * 0.065);
    g.addColorStop(0, rgba(state.colour, a)); g.addColorStop(0.4, rgba(state.colour, a * 0.78)); g.addColorStop(1, rgba(state.colour, 0));
    b.fillStyle = g; b.beginPath(); b.ellipse(x, y, rx, ry, rand() * Math.PI, 0, Math.PI * 2); b.fill();
  }
  state.brush = brush;
}

function frame(now) {
  const dt = Math.min(0.05, (now - state.last) / 1000);
  state.last = now;
  if (state.playing) { state.time += dt; updateForms(dt); }
  draw();
  updateFps(dt);
  requestAnimationFrame(frame);
}
function updateForms(dt) {
  for (let i = 0; i < state.puffs.length; i += 1) { state.puffs[i].age += dt / state.puffs[i].life; if (state.puffs[i].age >= 1) state.puffs[i] = makePuff(Math.random, false); }
  for (let i = 0; i < state.ribbons.length; i += 1) { state.ribbons[i].age += dt / state.ribbons[i].life; if (state.ribbons[i].age >= 1) state.ribbons[i] = makeRibbon(Math.random, false); }
}
function updateFps(dt) {
  state.fpsFrames += 1; state.fpsTime += dt;
  if (state.fpsTime >= 0.55) { byId('fps').textContent = `FPS: ${Math.round(state.fpsFrames / state.fpsTime)}`; state.fpsFrames = 0; state.fpsTime = 0; }
}

function draw() {
  const fit = fitStage(canvas.width, canvas.height);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#020203'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save(); ctx.translate(fit.x, fit.y); ctx.scale(fit.scale, fit.scale);
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
  fx.setTransform(1, 0, 0, 1, 0, 0); fx.clearRect(0, 0, fxCanvas.width, fxCanvas.height); fx.save(); fx.scale(FX_SCALE, FX_SCALE);
  drawPuffs(fx); drawRibbons(fx);
  if (state.mode === 'vignette') cutTransparentCentre(fx);
  fx.restore();
  context.save(); context.globalCompositeOperation = 'screen'; context.imageSmoothingEnabled = true; context.drawImage(fxCanvas, 0, 0, W, H); context.restore();
}
function drawPuffs(g) {
  g.save(); g.globalCompositeOperation = 'screen';
  for (const p of state.puffs) {
    const life = smoothEnvelope(p.age, 0.14, 0.25);
    let x = p.originX + state.drift * p.age * 145 + Math.sin(p.phase + state.time * 0.48) * state.turbulence * 20;
    let y = p.originY;
    if (state.mode === 'rising' || state.mode === 'wispy' || state.mode === 'emission') y -= p.age * (p.plume || 330) * (0.6 + state.rise);
    else y += Math.sin(state.time * 0.25 + p.phase) * state.turbulence * 10;
    const radius = p.radius * (0.65 + p.age * 0.95);
    g.save(); g.translate(x, y); g.rotate(p.spin * state.time); g.globalAlpha = state.opacity * p.alpha * life; g.drawImage(state.brush, -radius / 2, -radius / 2, radius, radius); g.restore();
  }
  g.restore();
}
function drawRibbons(g) {
  if (!state.ribbons.length) return;
  g.save(); g.globalCompositeOperation = 'screen'; g.lineCap = 'round'; g.lineJoin = 'round';
  for (const ribbon of state.ribbons) {
    const life = ribbon.age;
    const grown = clamp(life / 0.42, 0, 1);
    const overall = smoothEnvelope(life, 0.14, 0.27) * ribbon.alpha * state.opacity * state.wispBrightness;
    const length = ribbon.maxLength * grown;
    const segments = 18;
    const points = [];
    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments;
      const visibleT = t * grown;
      const yRise = visibleT * length;
      const turnTime = state.time * (0.35 + state.rotation * 1.25);
      const curl = Math.sin(ribbon.phase + visibleT * ribbon.turns * Math.PI * 2 + turnTime) * ribbon.sway;
      const fold = Math.cos(ribbon.phase * 1.7 - turnTime * 0.8 + visibleT * 9) * state.rotation * (6 + 23 * visibleT);
      const directionX = Math.sin(ribbon.tilt) * yRise * 0.42;
      const x = ribbon.originX + directionX + curl * (0.25 + visibleT * 0.8) + fold + state.drift * yRise;
      const y = ribbon.originY - yRise + Math.cos(ribbon.tilt) * curl * 0.12;
      points.push({ x, y });
    }
    for (let i = 1; i < points.length; i += 1) {
      const t = i / segments;
      const endFade = Math.sin(Math.PI * t);
      const taper = Math.pow(endFade, 0.35 + state.tailFade * 1.2);
      const a = overall * taper;
      if (a < 0.002) continue;
      const p0 = points[i - 1], p1 = points[i];
      g.strokeStyle = rgba(state.colour, a * 0.11); g.lineWidth = ribbon.width * (5.4 + state.wispWidth * 2.4) * taper; g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.stroke();
      g.strokeStyle = rgba(state.colour, a * (0.26 + state.definition * 0.32)); g.lineWidth = Math.max(0.8, ribbon.width * (0.62 + state.wispWidth * 0.54) * taper); g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.stroke();
    }
  }
  g.restore();
}
function cutTransparentCentre(g) {
  const cx = W / 2, cy = H / 2 + state.bias * 92, inner = H * state.clear * 0.46, outer = inner + 80 + state.edge * 180;
  g.save(); g.globalCompositeOperation = 'destination-out';
  const mask = g.createRadialGradient(cx, cy, inner, cx, cy, outer);
  mask.addColorStop(0, 'rgba(0,0,0,1)'); mask.addColorStop(0.67, 'rgba(0,0,0,0.97)'); mask.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = mask; g.fillRect(0, 0, W, H); g.restore();
}

function drawSceneBase(g, scene) {
  if (scene === 'transparent-check') { checker(g); return; }
  const p = palette(scene), grad = g.createLinearGradient(0, 0, 0, H); grad.addColorStop(0, p.skyTop); grad.addColorStop(0.64, p.skyBottom); grad.addColorStop(1, p.ground); g.fillStyle = grad; g.fillRect(0, 0, W, H);
  g.globalAlpha = 0.45; g.fillStyle = p.moon; g.beginPath(); g.arc(940, 124, scene === 'underworld' ? 84 : 54, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
  g.fillStyle = p.far; g.beginPath(); g.moveTo(0, 425); for (let x = 0; x <= W; x += 110) g.lineTo(x, 354 + Math.sin(x * 0.015) * 25); g.lineTo(W, H); g.lineTo(0, H); g.fill(); g.fillStyle = p.ground; g.fillRect(0, 512, W, 208);
}
function drawStructures(g, scene) {
  if (scene === 'transparent-check') return;
  const p = palette(scene); g.fillStyle = p.tree; for (const [x, top, size] of [[95,190,60],[183,168,68],[1060,180,63],[1162,214,52]]) { g.fillRect(x + size * 0.42, top + 95, size * 0.18, 280); for (let i = 0; i < 4; i += 1) { g.beginPath(); g.moveTo(x + size/2, top + i * 43); g.lineTo(x - i*7, top + 117 + i*45); g.lineTo(x + size + i*7, top + 117 + i*45); g.fill(); } }
  g.fillStyle = p.wall; g.fillRect(500, 167, 282, 393); g.fillRect(472, 204, 30, 356); g.fillRect(780, 204, 31, 356); g.fillStyle = p.edge; g.fillRect(490, 185, 301, 22); g.fillRect(465, 200, 42, 17); g.fillRect(776, 200, 43, 17);
  g.fillStyle = p.door; g.beginPath(); g.ellipse(641, 420, 74, 128, 0, Math.PI, 0); g.lineTo(715, 560); g.lineTo(567, 560); g.fill();
}
function drawFigures(g, scene) { if (scene === 'transparent-check') return; figure(g, 566, 516, 0.9); figure(g, 735, 506, 1.03); }
function figure(g, x, y, s) { g.save(); g.translate(x,y); g.scale(s,s); g.fillStyle='#24141f'; g.beginPath(); g.arc(0,-68,15,0,Math.PI*2); g.fill(); g.beginPath(); g.moveTo(-18,-51); g.lineTo(-37,67); g.lineTo(35,67); g.lineTo(18,-51); g.fill(); g.restore(); }
function drawMarker(g) { const x=W*state.sourceX/100,y=H*state.sourceY/100; g.save(); g.strokeStyle='#27d7ff'; g.lineWidth=2; g.beginPath(); g.arc(x,y,Math.max(9,state.sourceWidth/2),0,Math.PI*2); g.stroke(); g.beginPath(); g.moveTo(x-18,y);g.lineTo(x+18,y);g.moveTo(x,y-18);g.lineTo(x,y+18);g.stroke();g.restore(); }
function vignette(g) { const v=g.createRadialGradient(W/2,H/2,W*0.26,W/2,H/2,W*0.66);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.58)');g.fillStyle=v;g.fillRect(0,0,W,H); }
function checker(g) { for (let y=0;y<H;y+=48) for(let x=0;x<W;x+=48){ g.fillStyle=((x/48+y/48)%2===0)?'#2b2627':'#171416'; g.fillRect(x,y,48,48); } }
function palette(scene) { return ({'forest-gate':{skyTop:'#080e13',skyBottom:'#17231f',ground:'#090d0b',far:'#101813',moon:'#b4c7d2',tree:'#080b08',wall:'#241a13',edge:'#483326',door:'#050706'},'ruined-road':{skyTop:'#100b11',skyBottom:'#2a201b',ground:'#15100e',far:'#1c1613',moon:'#d4bb91',tree:'#100c0c',wall:'#3a2f24',edge:'#745739',door:'#0b0808'},underworld:{skyTop:'#050307',skyBottom:'#18091c',ground:'#080409',far:'#0b060f',moon:'#573265',tree:'#070409',wall:'#161018',edge:'#392142',door:'#010203'}})[scene] || palette('forest-gate'); }

function updateJson() {
  const data = { engine:'smoke', status:'debug-prototype-not-runtime-schema', mode:state.mode, previewLayer:state.layer, performance:{ reducedBufferScale:FX_SCALE }, appearance:{ colour:state.colour, opacity:state.opacity, puffDensity:state.density, puffSize:state.puffSize, puffDefinition:state.definition }, ribbonWisps:{ count:state.wispCount, brightness:state.wispBrightness, maximumLength:state.wispLength, width:state.wispWidth, endFade:state.tailFade, curl:state.curl, rotationalFold:state.rotation, formDurationSeconds:state.duration }, movement:{ riseSpeed:state.rise, driftSpeed:state.drift, turbulence:state.turbulence }, vignette:{ centreOpening:state.clear, edgeDepth:state.edge, verticalBias:state.bias }, emission:{ xPercent:state.sourceX, yPercent:state.sourceY, sourceWidth:state.sourceWidth, plumeHeight:state.height } };
  byId('json-output').textContent = JSON.stringify(data, null, 2);
}
function resizeCanvas() { const rect=canvas.getBoundingClientRect(), ratio=Math.min(2,window.devicePixelRatio||1); canvas.width=Math.max(640,Math.round(rect.width*ratio)); canvas.height=Math.max(360,Math.round(rect.height*ratio)); }
function fitStage(width,height) { const scale=Math.min(width/W,height/H); return {scale,x:(width-W*scale)/2,y:(height-H*scale)/2}; }
function smoothEnvelope(t, fadeIn, fadeOut) { return Math.min(1,t/fadeIn) * Math.min(1,(1-t)/fadeOut); }
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function normalHex(v,fallback){return /^#[0-9a-f]{6}$/i.test(String(v).trim())?String(v).trim().toLowerCase():fallback;}
function rgba(hex,a){const h=normalHex(hex,'#ffffff').slice(1);return `rgba(${parseInt(h.slice(0,2),16)}, ${parseInt(h.slice(2,4),16)}, ${parseInt(h.slice(4,6),16)}, ${clamp(a,0,1)})`;}
function seeded(seed){let v=seed>>>0;return()=>{v=(v*1664525+1013904223)>>>0;return v/4294967296;};}
function byId(id){return document.getElementById(id);}
function snapshot(){const link=document.createElement('a');link.download=`smoke-engine-${state.mode}.png`;link.href=canvas.toDataURL('image/png');link.click();}
async function copyJson(){try{await navigator.clipboard.writeText(byId('json-output').textContent);toast('Smoke settings copied.');}catch(error){toast('Copy unavailable; use the JSON panel.');}}
let toastTimer;function toast(text){const el=byId('toast');el.textContent=text;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2200);}
