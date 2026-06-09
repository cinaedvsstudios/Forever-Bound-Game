const TAU = Math.PI * 2;
const STRUCTURED_EFFECT_ENGINES = new Set(['portal-ring', 'wormhole-tunnel']);
const LAYER_POSITIONS = ['back', 'aperture', 'rim-back', 'rim-front', 'particles-front', 'front'];

export function isStructuredEffectLayer(layer) {
  return STRUCTURED_EFFECT_ENGINES.has(layer?.engine);
}

export function drawStructuredEffectLayer(ctx, layer, scaleValue = 1, timeMs = 0) {
  if (!isStructuredEffectLayer(layer) || layer.visible === false) return;
  const t = (Number(timeMs) || 0) / 1000;
  const geometry = makeGeometry(layer, scaleValue);
  if (layer.engine === 'portal-ring') drawPortalRing(ctx, layer, geometry, t);
  if (layer.engine === 'wormhole-tunnel') drawWormholeTunnel(ctx, layer, geometry, t);
}

function drawPortalRing(ctx, layer, g, t) {
  const jobs = [];
  const add = (position, draw) => jobs.push({ position: normalizeLayerPosition(position), draw });

  add('back', () => drawPortalAperture(ctx, layer, g));
  add('rim-back', () => drawPortalCloudRim(ctx, layer, g, t));
  add(layer.innerWispLayerPosition || 'rim-front', () => drawPortalInnerWisps(ctx, layer, g, t));
  add('particles-front', () => drawOrbitClouds(ctx, layer, g, t, 'portal'));
  add('particles-front', () => drawPortalParticles(ctx, layer, g, t));
  add(layer.outlineLayerPosition || 'front', () => drawPortalLineOutline(ctx, layer, g, t));
  runLayerJobs(jobs);
}

function drawPortalAperture(ctx, layer, g) {
  const opacity = percent(layer.apertureOpacity, 26);
  if (opacity <= 0) return;
  const radius = g.radius * ratio(layer.apertureRadius, 78, 30, 120);
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  const gradient = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, radius);
  gradient.addColorStop(0, withAlpha(layer.apertureColor || '#07132d', opacity * 0.9));
  gradient.addColorStop(0.72, withAlpha(layer.apertureColor || '#07132d', opacity * 0.48));
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(g.x, g.y, radius, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawPortalCloudRim(ctx, layer, g, t) {
  const opacity = percent(layer.rimOpacity, 42);
  if (opacity <= 0) return;
  const amount = Math.round(clamp(num(layer.rimAmount, 42), 0, 80));
  const thickness = g.radius * ratio(layer.rimThickness, 24, 4, 55);
  const softness = ratio(layer.rimSoftness, 34, 1, 70);
  const radius = g.radius * ratio(layer.rimRadius, 82, 35, 120);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = `blur(${Math.max(0, thickness * softness * 0.14)}px)`;
  for (let i = 0; i < amount; i += 1) {
    const h = hash(i + 4.11);
    const p = i / Math.max(1, amount);
    const angle = p * TAU + t * num(layer.rimSpeed, 8) * 0.025 + h * 0.8;
    const wobble = Math.sin(t * 1.2 + i * 1.71) * thickness * 0.25;
    const x = g.x + Math.cos(angle) * (radius + wobble);
    const y = g.y + Math.sin(angle) * (radius + wobble);
    const size = thickness * (0.65 + h * 1.25);
    softBlob(ctx, x, y, size, pickColor(layer, h), opacity * (0.16 + h * 0.18));
  }
  ctx.restore();
}

function drawPortalInnerWisps(ctx, layer, g, t) {
  const opacity = percent(layer.innerWispOpacity, 32);
  const amount = Math.round(clamp(num(layer.innerWispAmount, 7), 0, 24));
  if (opacity <= 0 || amount <= 0) return;
  const thickness = clamp(num(layer.innerWispThickness, 2.5), 0, 16) * g.scale;
  const glow = clamp(num(layer.innerWispGlow, 14), 0, 70) * g.scale;
  const curl = clamp(num(layer.innerWispCurl, 48), 0, 100) / 100;
  const speed = num(layer.innerWispSpeed, 18) * 0.025;
  const spread = ratio(layer.innerWispVerticalSpread, 54, 0, 100) * g.radius * 1.3;
  const width = g.radius * 1.55;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowBlur = glow;
  for (let i = 0; i < amount; i += 1) {
    const h = hash(i + 7.31);
    const yBase = g.y + ((i / Math.max(1, amount - 1)) - 0.5) * spread + (h - 0.5) * spread * 0.22;
    const phase = t * speed + h * TAU;
    const amp = g.radius * (0.08 + curl * 0.22) * (0.65 + h * 0.75);
    ctx.strokeStyle = withAlpha(pickColor(layer, h, 'innerWispColorA', 'innerWispColorB'), opacity * (0.46 + h * 0.3));
    ctx.shadowColor = pickColor(layer, h, 'innerWispColorA', 'innerWispColorB');
    ctx.lineWidth = Math.max(0.2, thickness * (0.7 + h * 0.7));
    ctx.beginPath();
    for (let s = 0; s <= 38; s += 1) {
      const u = s / 38;
      const x = g.x - width / 2 + u * width;
      const y = yBase + Math.sin(u * TAU * (1.1 + curl * 2.4) + phase + i) * amp;
      if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawPortalLineOutline(ctx, layer, g, t) {
  const opacity = percent(layer.outlineOpacity, 78);
  if (opacity <= 0) return;
  const thickness = Math.max(0.2, num(layer.outlineThickness, 2.5) * g.scale);
  const radius = g.radius * ratio(layer.outlineRadius, 86, 40, 130) * (1 + Math.sin(t * num(layer.outlinePulseSpeed, 12) * 0.08) * percent(layer.outlinePulseStrength, 8) * 0.04);
  const glow = clamp(num(layer.outlineGlow, 24), 0, 100) * g.scale;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = withAlpha(pickColor(layer, (Math.sin(t) + 1) / 2, 'outlineColorA', 'outlineColorB'), opacity);
  ctx.shadowColor = pickColor(layer, 0.5, 'outlineColorA', 'outlineColorB');
  ctx.shadowBlur = glow;
  ctx.lineWidth = thickness;
  ctx.beginPath();
  ctx.arc(g.x, g.y, radius, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawPortalParticles(ctx, layer, g, t) {
  const opacity = percent(layer.particleOpacity, 28);
  const amount = Math.round(clamp(num(layer.particleAmount, 32), 0, 90));
  if (opacity <= 0 || amount <= 0) return;
  const size = clamp(num(layer.particleSize, 3), 0, 24) * g.scale;
  const spread = ratio(layer.particleSpread, 68, 20, 130) * g.radius;
  const speed = num(layer.particleSpeed, 18) * 0.025;
  const glow = clamp(num(layer.particleGlow, 12), 0, 60) * g.scale;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.shadowBlur = glow;
  for (let i = 0; i < amount; i += 1) {
    const h = hash(i + 11.01);
    const a = h * TAU + t * speed * (0.3 + hash(i) * 0.8);
    const r = spread * (0.15 + hash(i + 2) * 0.85);
    const color = pickColor(layer, h);
    ctx.fillStyle = withAlpha(color, opacity * (0.25 + hash(i + 3) * 0.55));
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(g.x + Math.cos(a) * r, g.y + Math.sin(a) * r, size * (0.45 + hash(i + 4)), 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawWormholeTunnel(ctx, layer, g, t) {
  drawWormholeCore(ctx, layer, g, t);
  drawWormholeArms(ctx, layer, g, t);
  drawOrbitClouds(ctx, layer, g, t, 'wormhole');
  drawWormholeParticles(ctx, layer, g, t);
  drawWormholeEmission(ctx, layer, g, t);
}

function drawWormholeCore(ctx, layer, g, t) {
  const opacity = percent(layer.coreOpacity, 38);
  if (opacity <= 0) return;
  const radius = g.radius * ratio(layer.coreRadius, 24, 4, 70);
  const pulse = 1 + Math.sin(t * 2.2) * percent(layer.corePulseStrength, 8) * 0.08;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, radius * pulse);
  grad.addColorStop(0, withAlpha('#ffffff', clamp(opacity * 0.55, 0, 0.34)));
  grad.addColorStop(0.35, withAlpha(layer.colorA || '#58f4ff', clamp(opacity * 0.48, 0, 0.28)));
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(g.x, g.y, radius * pulse, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawWormholeArms(ctx, layer, g, t) {
  const opacity = percent(layer.armOpacity, 16);
  const amount = Math.round(clamp(num(layer.armAmount, 28), 0, 72));
  if (opacity <= 0 || amount <= 0) return;
  const thickness = g.radius * ratio(layer.armThickness, 28, 3, 80);
  const radius = g.radius * ratio(layer.armRadius, 58, 8, 125);
  const definition = ratio(layer.armDefinition, 48, 5, 100);
  const softness = ratio(layer.armSoftness, 34, 0, 100);
  const rotation = t * num(layer.armRotationSpeed, 8) * 0.035;
  const turns = ratio(layer.armCurlTurns, 62, 0, 100) * 4.5;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = `blur(${Math.max(0, thickness * softness * 0.08)}px)`;
  for (let i = 0; i < amount; i += 1) {
    const h = hash(i + 21.5);
    const a = h * TAU + rotation;
    const len = radius * (0.45 + hash(i + 1) * 0.7);
    const width = thickness * (0.45 + hash(i + 2) * 0.9);
    const color = pickColor(layer, h);
    ctx.strokeStyle = withAlpha(color, clamp(opacity * (0.18 + definition * 0.22), 0, 0.28));
    ctx.shadowBlur = clamp(num(layer.glow, 14), 0, 34) * g.scale;
    ctx.shadowColor = color;
    ctx.lineWidth = Math.max(0.7, width);
    ctx.beginPath();
    for (let s = 0; s <= 20; s += 1) {
      const u = s / 20;
      const aa = a + u * turns + Math.sin(u * Math.PI + t + h) * 0.3;
      const rr = len * u;
      const x = g.x + Math.cos(aa) * rr;
      const y = g.y + Math.sin(aa) * rr;
      if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawOrbitClouds(ctx, layer, g, t, mode) {
  const prefix = mode === 'portal' ? 'cloud' : 'cloud';
  const opacity = percent(layer[`${prefix}Opacity`], mode === 'portal' ? 24 : 14);
  const amount = Math.round(clamp(num(layer[`${prefix}Amount`], mode === 'portal' ? 24 : 18), 0, 72));
  if (opacity <= 0 || amount <= 0) return;
  const size = g.radius * ratio(layer[`${prefix}Size`], mode === 'portal' ? 14 : 12, 2, 55);
  const radius = g.radius * ratio(layer.orbitRadius, mode === 'portal' ? 100 : 64, 8, 150);
  const speed = num(layer.cloudOrbitSpeed, mode === 'portal' ? 9 : 7) * 0.026;
  const stagger = ratio(layer.cloudStagger, 42, 0, 100) * 0.65;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = `blur(${Math.max(1, size * 0.36)}px)`;
  for (let i = 0; i < amount; i += 1) {
    const h = hash(i + 33.7);
    const a = (i / Math.max(1, amount)) * TAU + t * speed * (0.45 + h) + h * stagger;
    const r = radius * (0.8 + hash(i + 2) * 0.34);
    softBlob(ctx, g.x + Math.cos(a) * r, g.y + Math.sin(a) * r, size * (0.55 + h), pickColor(layer, h), clamp(opacity * (0.16 + h * 0.18), 0, 0.22));
  }
  ctx.restore();
}

function drawWormholeParticles(ctx, layer, g, t) {
  const opacity = percent(layer.particleOpacity, 28);
  const amount = Math.round(clamp(num(layer.particleAmount, 24), 0, 90));
  if (opacity <= 0 || amount <= 0) return;
  const spread = ratio(layer.particleSpread, 46, 8, 130) * g.radius;
  const speed = num(layer.particleSpeed, 16) * 0.03;
  const size = clamp(num(layer.particleSize, 2.6), 0, 18) * g.scale;
  const glow = clamp(num(layer.particleGlow, 12), 0, 50) * g.scale;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.shadowBlur = glow;
  for (let i = 0; i < amount; i += 1) {
    const h = hash(i + 44.4);
    const a = h * TAU + t * speed * (0.5 + hash(i + 2));
    const r = spread * (0.1 + hash(i + 3) * 0.9);
    const color = pickColor(layer, h);
    ctx.fillStyle = withAlpha(color, clamp(opacity * (0.22 + h * 0.42), 0, 0.36));
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(g.x + Math.cos(a) * r, g.y + Math.sin(a) * r, size * (0.6 + hash(i + 5)), 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawWormholeEmission(ctx, layer, g, t) {
  const opacity = percent(layer.emissionOpacity, 0);
  const amount = Math.round(clamp(num(layer.emissionAmount, 0), 0, 60));
  if (opacity <= 0 || amount <= 0) return;
  const direction = num(layer.emissionDirection, 0);
  const vacuum = layer.emissionVacuum === true;
  const speed = num(layer.emissionSpeed, 18) * 0.035;
  const trail = clamp(num(layer.emissionTrailLength, 30), 0, 150) * g.scale;
  const trailOpacity = percent(layer.emissionTrailOpacity, 28);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.lineCap = 'round';
  for (let i = 0; i < amount; i += 1) {
    const h = hash(i + 55.2);
    const baseAngle = direction === 0 ? h * TAU : direction * Math.PI / 180 + (h - 0.5) * 0.45;
    const travel = ((t * speed + h) % 1) * g.radius * 1.5;
    const sign = vacuum ? -1 : 1;
    const x = g.x + Math.cos(baseAngle) * travel * sign;
    const y = g.y + Math.sin(baseAngle) * travel * sign;
    const color = pickColor(layer, h);
    ctx.strokeStyle = withAlpha(color, clamp(opacity * trailOpacity, 0, 0.22));
    ctx.lineWidth = Math.max(0.5, 1.2 * g.scale);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - Math.cos(baseAngle) * trail * sign, y - Math.sin(baseAngle) * trail * sign);
    ctx.stroke();
    ctx.fillStyle = withAlpha(color, clamp(opacity * 0.7, 0, 0.38));
    ctx.beginPath();
    ctx.arc(x, y, 2.2 * g.scale, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function runLayerJobs(jobs) {
  const rank = new Map(LAYER_POSITIONS.map((name, index) => [name, index]));
  jobs.sort((a, b) => (rank.get(a.position) || 0) - (rank.get(b.position) || 0)).forEach((job) => job.draw());
}
function normalizeLayerPosition(value) { return LAYER_POSITIONS.includes(value) ? value : 'front'; }
function makeGeometry(layer, scaleValue) {
  const scale = Math.max(0.01, Number(scaleValue) || 1);
  const base = Math.min(1280, 720) * scale;
  return {
    scale,
    x: num(layer.emitterX, 640) * scale,
    y: num(layer.emitterY, 360) * scale,
    radius: base * ratio(layer.effectScale, 62, 8, 120) * 0.42
  };
}
function softBlob(ctx, x, y, radius, color, alpha) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, radius));
  gradient.addColorStop(0, withAlpha(color, alpha));
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1, radius), 0, TAU);
  ctx.fill();
}
function pickColor(layer, mix = 0, keyA = 'colorA', keyB = 'colorB') {
  return mixHex(normalizeHex(layer[keyA] || layer.colorA || '#4ff7ff'), normalizeHex(layer[keyB] || layer.colorB || '#be55ff'), clamp(mix, 0, 1));
}
function mixHex(a, b, t) {
  const ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16);
  return `#${hex(ar + (br - ar) * t)}${hex(ag + (bg - ag) * t)}${hex(ab + (bb - ab) * t)}`;
}
function hex(value) { return Math.round(clamp(value, 0, 255)).toString(16).padStart(2, '0'); }
function withAlpha(hex, alpha) {
  const color = normalizeHex(hex);
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
}
function normalizeHex(value) {
  const string = String(value || '').trim();
  if (/^#[0-9a-f]{6}$/iu.test(string)) return string;
  if (/^#[0-9a-f]{3}$/iu.test(string)) return `#${string.slice(1).split('').map((char) => char + char).join('')}`;
  return '#4ff7ff';
}
function ratio(value, fallback, min, max) { return clamp(num(value, fallback), min, max) / 100; }
function percent(value, fallback) { return clamp(num(value, fallback), 0, 100) / 100; }
function num(value, fallback) { const number = Number(value); return Number.isFinite(number) ? number : fallback; }
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function hash(value) { return Math.abs(Math.sin(value * 12.9898) * 43758.5453) % 1; }
