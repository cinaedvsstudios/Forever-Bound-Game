const TAU = Math.PI * 2;

export function isPrototypeRenderableLayer(layer) {
  return Boolean(layer && layer.visible !== false && (layer.engine === 'prototype-smoke' || layer.engine === 'prototype-shimmer' || layer.prototypeFolder));
}

export function drawPrototypeLayer(ctx, layer, scaleValue = 1, timeMs = 0, stage = {}) {
  if (!isPrototypeRenderableLayer(layer)) return;
  const t = (Number(timeMs) || 0) / 1000;
  const stageWidth = Number(stage.width) || 1280;
  const stageHeight = Number(stage.height) || 720;
  if (layer.engine === 'prototype-smoke' || layer.prototypeFolder === 'smoke-engine') {
    drawPrototypeSmoke(ctx, layer, scaleValue, t, stageWidth, stageHeight);
    return;
  }
  drawPrototypeShimmer(ctx, layer, scaleValue, t, stageWidth, stageHeight);
}

function drawPrototypeSmoke(ctx, layer, scale, t, stageWidth, stageHeight) {
  const mode = layer.mode || layer.prototypeMode || 'rising';
  if (mode === 'vignette') return drawSmokeVignette(ctx, layer, scale, t, stageWidth, stageHeight);
  if (mode === 'fullscreen') return drawFullScreenSmoke(ctx, layer, scale, t, stageWidth, stageHeight);
  if (mode === 'emission') return drawEmissionSmoke(ctx, layer, scale, t, stageWidth, stageHeight);
  if (mode === 'wispy') return drawWispySmoke(ctx, layer, scale, t, stageWidth, stageHeight);
  return drawRisingSmoke(ctx, layer, scale, t, stageWidth, stageHeight);
}

function drawRisingSmoke(ctx, layer, scale, t, stageWidth, stageHeight) {
  const x = finite(layer.emitterX, stageWidth * 0.5) * scale;
  const y = finite(layer.emitterY, stageHeight * 0.72) * scale;
  const density = unitValue(layer.density, 0.86);
  drawSmokeBody(ctx, layer, x, y, scale, t, { width: (170 + density * 140) * scale, height: (220 + density * 210) * scale, rise: true, countBias: 1 });
  drawSmokeWisps(ctx, layer, x, y, scale, t, { width: (140 + density * 130) * scale, height: (230 + density * 180) * scale, countBias: 1 });
}

function drawWispySmoke(ctx, layer, scale, t, stageWidth, stageHeight) {
  const x = finite(layer.emitterX, stageWidth * 0.5) * scale;
  const y = finite(layer.emitterY, stageHeight * 0.7) * scale;
  drawSmokeBody(ctx, layer, x, y, scale, t, { width: 180 * scale, height: 280 * scale, rise: true, countBias: 0.38, alphaBias: 0.48 });
  drawSmokeWisps(ctx, layer, x, y, scale, t, { width: 220 * scale, height: 360 * scale, countBias: 1.4, thin: true });
}

function drawEmissionSmoke(ctx, layer, scale, t, stageWidth, stageHeight) {
  const x = percentPoint(layer.sourceX, 50, stageWidth) * scale;
  const y = percentPoint(layer.sourceY, 76, stageHeight) * scale;
  const width = finite(layer.sourceWidth, 34) * scale;
  const height = finite(layer.height, 400) * scale;
  const density = unitValue(layer.density, 0.86);
  drawSmokeBody(ctx, layer, x, y, scale, t, { width: Math.max(width * (3 + density * 3), 130 * scale), height, rise: true, countBias: 1.15 });
  drawSmokeWisps(ctx, layer, x, y, scale, t, { width: Math.max(width * (2.6 + density * 2.3), 110 * scale), height, countBias: 1.05 });
  if (layer.showMarker) drawSmokeOriginMarker(ctx, x, y, width, scale);
}

function drawFullScreenSmoke(ctx, layer, scale, t, stageWidth, stageHeight) {
  const tint = layer.colour || layer.colourHex || layer.colorA || '#dce2e7';
  const opacity = unitValue(layer.mistOpacity, 0.36) * 0.46;
  const density = unitValue(layer.density, 0.86);
  const amount = Math.round(16 + density * 78);
  const puff = clamp(finite(layer.puffSize, 1.73), 0.25, 2.4) * (74 + density * 55) * scale;
  const speed = smokeSpeed(layer, 0.035);
  const turbulence = unitValue(layer.turbulence, 0.54);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = `blur(${Math.max(8, puff * (0.06 + (1 - unitValue(layer.definition, 0.82)) * 0.1))}px)`;
  for (let i = 0; i < amount; i += 1) {
    const h = hash(i * 2.13);
    const phase = (t * speed * (0.85 + h * 0.9) + h) % 1;
    const x = ((hash(i + 10) * stageWidth + Math.sin(t * 0.17 + i) * 90 * turbulence) % stageWidth) * scale;
    const y = ((phase * stageHeight * 1.35) - stageHeight * 0.18 + hash(i + 20) * 80) * scale;
    softBlob(ctx, x, y, puff * (0.45 + h * 1.4), tint, opacity * (0.18 + h * 0.36));
  }
  ctx.restore();
}

function drawSmokeVignette(ctx, layer, scale, t, stageWidth, stageHeight) {
  const tint = layer.colour || layer.colourHex || layer.colorA || '#dce2e7';
  const opacity = unitValue(layer.mistOpacity, 0.36) * 0.72;
  const edge = unitValue(layer.edge, 0.64);
  const clear = clamp(finite(layer.clear, 0.54), 0.18, 0.9);
  const bias = clamp(finite(layer.bias, 0), -1, 1);
  const width = stageWidth * scale;
  const height = stageHeight * scale;
  const density = unitValue(layer.density, 0.86);
  const amount = Math.round(28 + edge * 78 + density * 28);
  const puff = (45 + edge * 145 + density * 24) * scale;
  const speed = smokeSpeed(layer, 0.22);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = `blur(${Math.max(10, puff * 0.1)}px)`;
  for (let i = 0; i < amount; i += 1) {
    const side = i % 4;
    const h = hash(i + 31);
    const wobble = Math.sin(t * speed + i * 1.9) * 34 * scale;
    let x = hash(i + 4) * width;
    let y = hash(i + 8) * height;
    if (side === 0) y = -puff * 0.25 + wobble + bias * 90 * scale;
    if (side === 1) x = width + puff * 0.12 + wobble;
    if (side === 2) y = height + puff * 0.12 + wobble + bias * 90 * scale;
    if (side === 3) x = -puff * 0.12 + wobble;
    softBlob(ctx, x, y, puff * (0.55 + h * 1.2), tint, opacity * (0.12 + h * 0.34));
  }
  ctx.globalCompositeOperation = 'destination-out';
  const center = ctx.createRadialGradient(width / 2, height * (0.5 + bias * 0.16), 0, width / 2, height * (0.5 + bias * 0.16), Math.min(width, height) * clear * 0.55);
  center.addColorStop(0, 'rgba(0,0,0,0.8)');
  center.addColorStop(0.68, 'rgba(0,0,0,0.32)');
  center.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = center;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawSmokeBody(ctx, layer, x, y, scale, t, options = {}) {
  const tint = layer.colour || layer.colourHex || layer.colorA || '#dce2e7';
  const opacity = unitValue(layer.mistOpacity, 0.36) * finite(options.alphaBias, 1);
  const density = unitValue(layer.density, 0.86);
  const definition = unitValue(layer.definition, 0.82);
  const amount = Math.round((6 + density * 38) * finite(options.countBias, 1));
  const puff = clamp(finite(layer.puffSize, 1.73), 0.25, 2.4) * (34 + density * 24) * scale;
  const width = finite(options.width, 240 * scale);
  const height = finite(options.height, 300 * scale);
  const gravityAngle = finite(layer.gravityAngle, -90) * Math.PI / 180;
  const gravity = clamp(finite(layer.gravity, 0.31), -1.5, 1.5);
  const drift = finite(layer.drift, 0.13) * 65 * scale;
  const turbulence = unitValue(layer.turbulence, 0.54);
  const speed = smokeSpeed(layer, 0.052);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = `blur(${Math.max(3, puff * (0.06 + (1 - definition) * 0.16))}px)`;
  for (let i = 0; i < amount; i += 1) {
    const h = hash(i + 1.51);
    const life = (t * speed * (0.75 + h * 0.8) + h) % 1;
    const rise = life * height;
    const angleX = Math.cos(gravityAngle) * rise * gravity;
    const angleY = Math.sin(gravityAngle) * rise * Math.max(0.18, Math.abs(gravity));
    const wave = Math.sin(t * (0.45 + h) + i * 2.1) * width * turbulence * 0.34;
    const px = x + angleX + (h - 0.5) * width + wave + drift * life;
    const py = y + angleY - (options.rise === false ? 0 : rise * 0.05);
    const alpha = opacity * (0.1 + h * 0.24) * Math.sin(life * Math.PI);
    softBlob(ctx, px, py, puff * (0.55 + h * 1.45) * (0.75 + life * 0.55), tint, alpha);
  }
  ctx.restore();
}

function drawSmokeWisps(ctx, layer, x, y, scale, t, options = {}) {
  const count = Math.round(clamp(finite(layer.wispCount, 13), 0, 50) * finite(options.countBias, 1));
  if (count <= 0) return;
  const tint = layer.colour || layer.colourHex || layer.colorA || '#dce2e7';
  const opacity = clamp(finite(layer.wispBrightness, 0.09), 0, 1.5);
  const length = clamp(finite(layer.wispLength, 0.95), 0.15, 1.2);
  const widthFactor = clamp(finite(layer.wispWidth, 0.42), 0.05, 1.2);
  const curl = unitValue(layer.curl, 0.94);
  const rotation = unitValue(layer.rotation, 0.91);
  const tailFade = clamp(finite(layer.tailFade, 0.98), 0.05, 1);
  const width = finite(options.width, 220 * scale);
  const height = finite(options.height, 300 * scale) * length;
  const speed = smokeSpeed(layer, 0.32);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = tint;
  ctx.shadowBlur = (options.thin ? 5 : 9) * scale * (0.5 + opacity);
  for (let i = 0; i < count; i += 1) {
    const h = hash(i + 80);
    const phase = t * speed * (0.6 + rotation * 0.9 + h * 0.35) + h * TAU;
    const baseX = x + (h - 0.5) * width;
    const baseY = y - hash(i + 2) * height * 0.18;
    const lineWidth = Math.max(0.5, (options.thin ? 1.3 : 3.8) * scale * widthFactor * (0.55 + h));
    ctx.strokeStyle = withAlpha(tint, opacity * (0.18 + h * 0.28));
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    for (let s = 0; s <= 22; s += 1) {
      const u = s / 22;
      const fade = Math.sin(Math.min(1, u / tailFade) * Math.PI);
      const px = baseX + Math.sin(u * TAU * (1.1 + curl * 2.8) + phase) * width * 0.18 * fade;
      const py = baseY - u * height + Math.cos(phase + u * TAU) * height * 0.04;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawSmokeOriginMarker(ctx, x, y, width, scale) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,202,102,0.82)';
  ctx.lineWidth = Math.max(1, 1.4 * scale);
  ctx.beginPath();
  ctx.moveTo(x - width / 2, y);
  ctx.lineTo(x + width / 2, y);
  ctx.moveTo(x, y - 8 * scale);
  ctx.lineTo(x, y + 8 * scale);
  ctx.stroke();
  ctx.restore();
}

function drawPrototypeShimmer(ctx, layer, scale, t, stageWidth, stageHeight) {
  const type = resolveShimmerRenderType(layer);
  if (type === 'wormhole') return drawBasicWormhole(ctx, layer, scale, t, stageWidth, stageHeight);
  if (type === 'heat') return drawBasicHeatShimmer(ctx, layer, scale, t, stageWidth, stageHeight);
  if (type === 'transition') return drawBasicTransitionTear(ctx, layer, scale, t, stageWidth, stageHeight);
  return drawBasicPortalRing(ctx, layer, scale, t, stageWidth, stageHeight);
}

function resolveShimmerRenderType(layer) {
  const modeType = modeToType(layer.prototypeMode);
  if (modeType !== 'ring' && (!layer.type || layer.type === 'ring')) return modeType;
  if (['ring', 'wormhole', 'heat', 'transition'].includes(layer.type)) return layer.type;
  return modeType;
}

function drawBasicPortalRing(ctx, layer, scale, t, stageWidth, stageHeight) {
  const g = shimmerGeometry(layer, scale, stageWidth, stageHeight);
  const core = layer.coreColor || layer.colorA || '#32f1ff';
  const rim = layer.rimColor || layer.colorB || '#8e4dff';
  const accent = layer.accentColor || '#ffca66';
  const rimAlpha = percent100(layer.rimAlpha, 58);
  const middleAlpha = percent100(layer.middleAlpha, 62);
  const cloudiness = percent100(layer.cloudiness, 70);
  const textureStrength = percent100(layer.textureStrength, 68);
  const pulse = 1 + Math.sin(t * shimmerSpeed(layer, 0.48)) * percent100(layer.pulse, 52) * 0.13;
  const softness = percent100(layer.softness, 36);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = `blur(${Math.max(0, finite(layer.blur, 16) * 0.12 * scale + softness * 4 * scale)}px)`;
  if (layer.apertureEnabled !== false) drawAperture(ctx, layer, g, core, middleAlpha, pulse);
  const clouds = Math.round(clamp(finite(layer.orbitCloudAmount, 24), 0, 100));
  const cloudOpacity = percent100(layer.orbitCloudOpacity, 24) * Math.max(0.2, rimAlpha);
  const cloudSize = percent100(layer.orbitCloudSize, 48);
  const cloudRadius = percent100(layer.orbitCloudRadius, 76);
  const stagger = percent100(layer.orbitCloudStagger, 38);
  const cloudPulse = percent100(layer.orbitCloudPulseStrength, 12);
  ctx.filter = `blur(${Math.max(0, finite(layer.orbitCloudExtraBlur, 0) * 0.28 * scale)}px)`;
  for (let i = 0; i < clouds; i += 1) {
    const h = hash(i + 13);
    const a = h * TAU + t * shimmerSpeed(layer, finite(layer.orbitCloudSpeed, 35) * 0.024);
    const r = g.radius * (0.44 + cloudRadius * 0.85 + hash(i + 9) * stagger * 0.45) * pulse;
    const x = g.x + Math.cos(a) * r * g.scaleX;
    const y = g.y + Math.sin(a) * r * g.scaleY;
    const sizePulse = 1 + Math.sin(t * 1.6 + i) * cloudPulse * 0.45;
    softBlob(ctx, x, y, g.radius * (0.05 + cloudSize * 0.24 + h * 0.12) * sizePulse, h > 0.55 ? rim : core, cloudOpacity * (0.18 + cloudiness * 0.4));
  }
  ctx.filter = 'none';
  const rimWidth = Math.max(0.5, finite(layer.rimWidth, 68) * 0.035 * scale);
  drawRingStroke(ctx, g, rim, rimAlpha, rimWidth, finite(layer.glow, 54) * 0.22 * scale, t, layer);
  drawChromaticEcho(ctx, layer, g, t);
  drawRingStroke(ctx, g, layer.outlineColorA || accent, percent100(layer.outlineOpacity, 90), finite(layer.outlineThickness, 70) * 0.035 * scale, finite(layer.outlineGlow, 58) * 0.32 * scale, t, layer);
  drawPortalWisps(ctx, layer, g, t, layer.wispColorA || core, layer.wispColorB || accent);
  drawShimmerParticles(ctx, layer, g, t, accent, 'ring');
  drawOverlayPlaceholder(ctx, layer, g, t, 1);
  drawOverlayPlaceholder(ctx, layer, g, t, 2);
  ctx.restore();
}

function drawBasicWormhole(ctx, layer, scale, t, stageWidth, stageHeight) {
  const g = shimmerGeometry(layer, scale, stageWidth, stageHeight);
  const core = layer.coreColor || '#28dfff';
  const rim = layer.rimColor || '#255bff';
  const accent = layer.accentColor || '#9d5cff';
  const strength = percent100(layer.strength, 30);
  const rimAlpha = percent100(layer.rimAlpha, 22);
  const pulse = 1 + Math.sin(t * shimmerSpeed(layer, 0.44)) * percent100(layer.pulse, 28) * 0.18;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = `blur(${Math.max(0.4, finite(layer.blur, 22) * 0.08 * scale)}px)`;
  softBlob(ctx, g.x, g.y, g.radius * (1.05 + strength * 0.65), rim, 0.08 + rimAlpha * 0.18);
  softBlob(ctx, g.x, g.y, g.radius * (0.5 + strength * 0.4), core, 0.12 + strength * 0.18);
  drawRingStroke(ctx, g, rim, Math.max(0.18, rimAlpha), Math.max(1, finite(layer.rimWidth, 52) * 0.035 * scale), finite(layer.glow, 12) * 0.55 * scale, t, { outlinePulseSpeed: 18, outlinePulseStrength: finite(layer.pulse, 28) });
  const coreRadius = g.radius * (0.2 + percent100(layer.middleAlpha, 0) * 0.12 + strength * 0.18) * pulse;
  const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, Math.max(coreRadius * 3.6, g.radius * 0.55));
  grad.addColorStop(0, withAlpha('#ffffff', 0.28 + strength * 0.28));
  grad.addColorStop(0.22, withAlpha(core, 0.28 + strength * 0.28));
  grad.addColorStop(0.62, withAlpha(rim, 0.12 + rimAlpha * 0.3));
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(g.x, g.y, coreRadius, 0, TAU);
  ctx.fill();
  const arms = Math.round(clamp(finite(layer.armAmount, 64), 0, 100));
  const opacity = percent100(layer.armOpacity, 68);
  const definition = percent100(layer.armDefinition, 72);
  const softness = percent100(layer.armSoftness, 28);
  const pulseStrength = percent100(layer.armPulseStrength, 12);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.filter = `blur(${Math.max(0, (softness * 3 + finite(layer.armExtraBlur, 0) * 0.25) * scale)}px)`;
  for (let i = 0; i < arms; i += 1) {
    const h = hash(i + 101);
    const start = h * TAU + t * shimmerSpeed(layer, finite(layer.armSpeed, 34) * 0.032);
    const curl = finite(layer.armCurl, 72) / 100 * (3.8 + percent100(layer.swirl, 78) * 2.8);
    const length = g.radius * (0.28 + finite(layer.armRadius, 72) / 100 * 1.38) * (0.45 + h * 0.75) * pulse;
    const color = h > 0.56 ? rim : h > 0.24 ? accent : core;
    ctx.strokeStyle = withAlpha(color, opacity * (0.1 + h * 0.28));
    ctx.shadowColor = color;
    ctx.shadowBlur = Math.max(5, finite(layer.glow, 12) * 0.42 * scale);
    ctx.lineWidth = Math.max(0.8, finite(layer.armThickness, 58) * 0.12 * scale * (0.3 + h) * (0.8 + pulseStrength * Math.sin(t * 2 + i) * 0.35));
    ctx.beginPath();
    const segments = Math.round(16 + definition * 24);
    for (let s = 0; s <= segments; s += 1) {
      const u = s / segments;
      const a = start + u * curl + Math.sin(t + u * 4 + h) * 0.18;
      const r = length * u;
      const x = g.x + Math.cos(a) * r * g.scaleX;
      const y = g.y + Math.sin(a) * r * g.scaleY;
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.filter = 'none';
  drawOrbitClouds(ctx, layer, g, t, core, rim);
  drawShimmerParticles(ctx, layer, g, t, core, 'wormhole');
  drawEmissionTrails(ctx, layer, g, t, accent);
  drawOverlayPlaceholder(ctx, layer, g, t, 1);
  drawOverlayPlaceholder(ctx, layer, g, t, 2);
  ctx.restore();
}

function drawBasicHeatShimmer(ctx, layer, scale, t, stageWidth, stageHeight) {
  const g = shimmerGeometry(layer, scale, stageWidth, stageHeight);
  const core = layer.coreColor || '#ffe0a3';
  const rim = layer.rimColor || '#ff8a3d';
  const strength = percent100(layer.strength, 36);
  const refraction = percent100(layer.refraction, 78);
  const noise = percent100(layer.noise, 48);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = `blur(${Math.max(1.2, finite(layer.blur, 42) * 0.09 * scale)}px)`;
  const height = g.radius * (0.35 + refraction * 0.45) * g.scaleY;
  const width = g.radius * (1.55 + refraction * 1.15) * g.scaleX;
  const lines = Math.round(9 + noise * 28);
  ctx.lineCap = 'round';
  for (let i = 0; i < lines; i += 1) {
    const u = i / Math.max(1, lines - 1);
    const y = g.y - height / 2 + u * height;
    ctx.strokeStyle = withAlpha(i % 2 ? core : rim, 0.05 + strength * 0.2);
    ctx.lineWidth = Math.max(0.8, (0.7 + strength * 5.5) * scale);
    ctx.beginPath();
    for (let s = 0; s <= 30; s += 1) {
      const p = s / 30;
      const x = g.x - width / 2 + p * width;
      const wave = Math.sin(p * TAU * (1.2 + finite(layer.waveSize, 24) / 18) + t * shimmerSpeed(layer, finite(layer.waveSpeed, 58) * 0.08) + i) * (4 + strength * 35) * scale;
      const breakUp = Math.sin(p * TAU * (3 + noise * 9) + i) * noise * 12 * scale;
      if (s === 0) ctx.moveTo(x, y + wave + breakUp);
      else ctx.lineTo(x, y + wave + breakUp);
    }
    ctx.stroke();
  }
  softBlob(ctx, g.x, g.y, width * 0.32, core, 0.06 + strength * 0.16);
  ctx.restore();
}

function drawBasicTransitionTear(ctx, layer, scale, t, stageWidth, stageHeight) {
  const g = shimmerGeometry(layer, scale, stageWidth, stageHeight);
  const core = layer.coreColor || '#d7f7ff';
  const rim = layer.rimColor || '#8e4dff';
  const accent = layer.accentColor || '#ff2538';
  const strength = Math.max(0.08, percent100(layer.strength, 76));
  const noise = percent100(layer.noise, 94);
  const chromatic = percent100(layer.chromatic, 90);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = `blur(${Math.max(0.4, finite(layer.blur, 18) * 0.06 * scale)}px)`;
  softBlob(ctx, g.x, g.y, g.radius * (0.3 + strength * 0.55), accent, 0.07 + strength * 0.18);
  softBlob(ctx, g.x, g.y, g.radius * (0.18 + strength * 0.25), core, 0.12 + strength * 0.26);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const height = g.radius * (1.25 + strength * 1.1) * g.scaleY;
  const slices = Math.round(5 + noise * 14);
  for (let i = 0; i < slices; i += 1) {
    const h = hash(i + 300);
    const side = i - slices / 2;
    const color = i % 3 === 0 ? core : i % 2 ? rim : accent;
    ctx.strokeStyle = withAlpha(color, 0.08 + strength * 0.5);
    ctx.shadowBlur = (8 + strength * 22) * scale;
    ctx.shadowColor = color;
    ctx.lineWidth = Math.max(0.8, (1.1 + h * 7) * scale * (0.35 + strength));
    ctx.beginPath();
    for (let s = 0; s <= 22; s += 1) {
      const u = s / 22;
      const y = g.y - height / 2 + u * height;
      const x = g.x + side * (3 + chromatic * 12) * scale + Math.sin(u * TAU * (1.2 + h + noise) + t * shimmerSpeed(layer, finite(layer.waveSpeed, 96) * 0.1) + i) * g.radius * (0.06 + strength * 0.35);
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.filter = 'none';
  drawTearCrack(ctx, g, core, rim, accent, t, scale, layer);
  drawShimmerParticles(ctx, layer, g, t, core, 'transition');
  ctx.restore();
}

function drawTearCrack(ctx, g, core, rim, accent, t, scale, layer = {}) {
  const strength = percent100(layer.strength, 76);
  const pulse = 1 + Math.sin(t * shimmerSpeed(layer, finite(layer.waveSpeed, 70) * 0.06)) * percent100(layer.pulse, 88) * 0.2;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.lineCap = 'round';
  ctx.shadowBlur = (16 + strength * 25) * scale;
  ctx.shadowColor = core;
  ctx.strokeStyle = withAlpha(core, 0.38 + strength * 0.6);
  ctx.lineWidth = Math.max(1, (1.2 + strength * 4.2) * scale);
  ctx.beginPath();
  for (let s = 0; s <= 30; s += 1) {
    const u = s / 30;
    const y = g.y - g.radius * 1.05 * pulse + u * g.radius * 2.1 * pulse;
    const x = g.x + Math.sin(u * TAU * 1.65 + t * shimmerSpeed(layer, 5)) * g.radius * (0.07 + strength * 0.1) + Math.sin(u * TAU * 4.2) * g.radius * 0.05;
    if (s === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowColor = accent;
  ctx.strokeStyle = withAlpha(accent, 0.16 + strength * 0.42);
  ctx.lineWidth = Math.max(0.8, (0.8 + strength * 1.8) * scale);
  ctx.beginPath();
  ctx.moveTo(g.x - g.radius * 0.32, g.y - g.radius * 0.58);
  ctx.lineTo(g.x + g.radius * 0.22, g.y - g.radius * 0.24);
  ctx.moveTo(g.x + g.radius * 0.28, g.y + g.radius * 0.18);
  ctx.lineTo(g.x - g.radius * 0.24, g.y + g.radius * 0.56);
  ctx.stroke();
  drawChromaticEcho(ctx, layer, g, t);
  ctx.shadowColor = rim;
  drawRingStroke(ctx, g, rim, percent100(layer.rimAlpha, 46), Math.max(0.8, finite(layer.rimWidth, 18) * 0.035 * scale), 16 * scale, t, { outlinePulseSpeed: 36, outlinePulseStrength: finite(layer.pulse, 88) });
  ctx.restore();
}

function drawPortalWisps(ctx, layer, g, t, colorA, colorB) {
  const amount = Math.round(clamp(finite(layer.wispAmount, 44), 0, 100));
  const opacity = percent100(layer.wispOpacity, 42);
  if (amount <= 0 || opacity <= 0) return;
  const speed = shimmerSpeed(layer, finite(layer.wispSpeed, 46) * 0.048);
  const curl = finite(layer.wispCurl, 62) / 38;
  const spread = percent100(layer.wispVerticalSpread, 54);
  const size = percent100(layer.wispSize, 48);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.lineCap = 'round';
  ctx.shadowBlur = finite(layer.wispGlow, 38) * 0.18 * g.scale;
  for (let i = 0; i < amount; i += 1) {
    const h = hash(i + 70);
    const color = h > 0.5 ? colorA : colorB;
    ctx.shadowColor = color;
    ctx.strokeStyle = withAlpha(color, opacity * (0.09 + h * 0.24));
    ctx.lineWidth = Math.max(0.45, finite(layer.wispThickness, 42) * 0.035 * g.scale * (0.35 + h + size * 0.5));
    const yBase = g.y + (h - 0.5) * g.radius * (0.35 + spread * 1.35);
    ctx.beginPath();
    for (let s = 0; s <= 24; s += 1) {
      const u = s / 24;
      const x = g.x - g.radius * 0.9 + u * g.radius * 1.8;
      const y = yBase + Math.sin(u * TAU * (1.1 + curl) + t * speed + i) * g.radius * (0.06 + curl * 0.08);
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawOrbitClouds(ctx, layer, g, t, colorA, colorB) {
  const amount = Math.round(clamp(finite(layer.orbitCloudAmount, 0), 0, 100));
  const opacity = percent100(layer.orbitCloudOpacity, 8);
  if (amount <= 0 || opacity <= 0) return;
  const size = percent100(layer.orbitCloudSize, 32);
  const radius = percent100(layer.orbitCloudRadius, 60);
  const stagger = percent100(layer.orbitCloudStagger, 42);
  const pulse = percent100(layer.orbitCloudPulseStrength, 6);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = `blur(${Math.max(0, finite(layer.orbitCloudExtraBlur, 0) * 0.28 * g.scale)}px)`;
  for (let i = 0; i < amount; i += 1) {
    const h = hash(i + 800);
    const a = h * TAU + t * shimmerSpeed(layer, finite(layer.orbitCloudSpeed, 24) * 0.026);
    const r = g.radius * (0.38 + radius * 0.95 + h * stagger * 0.45);
    const p = 1 + Math.sin(t * 1.7 + i) * pulse * 0.45;
    softBlob(ctx, g.x + Math.cos(a) * r * g.scaleX, g.y + Math.sin(a) * r * g.scaleY, g.radius * (0.04 + size * 0.22) * p, h > 0.5 ? colorA : colorB, opacity * (0.2 + h * 0.35));
  }
  ctx.restore();
}

function drawEmissionTrails(ctx, layer, g, t, color) {
  const amount = Math.round(clamp(finite(layer.emissionAmount, 0), 0, 100));
  const opacity = percent100(layer.emissionOpacity, 0);
  if (amount <= 0 || opacity <= 0) return;
  const direction = finite(layer.emissionDirection, 0) * Math.PI / 180;
  const trailLength = percent100(layer.emissionTrailLength, 28) * g.radius * 1.2;
  const trailOpacity = percent100(layer.emissionTrailOpacity, 24);
  const speed = shimmerSpeed(layer, finite(layer.emissionSpeed, 34) * 0.05);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.lineCap = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 12 * g.scale;
  for (let i = 0; i < amount; i += 1) {
    const h = hash(i + 900);
    const phase = (t * speed + h) % 1;
    const outward = layer.emissionVacuum ? 1 - phase : phase;
    const angle = direction + (h - 0.5) * Math.PI * 1.4;
    const r = g.radius * (0.12 + outward * 1.15);
    const x = g.x + Math.cos(angle) * r * g.scaleX;
    const y = g.y + Math.sin(angle) * r * g.scaleY;
    const tx = x - Math.cos(angle) * trailLength * (layer.emissionVacuum ? -1 : 1);
    const ty = y - Math.sin(angle) * trailLength * (layer.emissionVacuum ? -1 : 1);
    ctx.strokeStyle = withAlpha(color, opacity * trailOpacity * (0.22 + h * 0.42));
    ctx.lineWidth = Math.max(0.7, (0.8 + h * 2.2) * g.scale);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(tx, ty);
    ctx.stroke();
  }
  ctx.restore();
}

function drawShimmerParticles(ctx, layer, g, t, color, mode) {
  const amount = Math.round(clamp(finite(layer.particleAmount, mode === 'transition' ? 34 : 36), 0, 100));
  const opacity = percent100(layer.particleOpacity, mode === 'wormhole' ? 28 : 48);
  if (amount <= 0 || opacity <= 0) return;
  const spread = percent100(layer.particleSpread, 72);
  const pulseStrength = percent100(layer.particlePulseStrength, 0);
  const speed = shimmerSpeed(layer, finite(layer.particleSpeed, 40) * 0.028);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.shadowColor = color;
  ctx.shadowBlur = finite(layer.particleGlow, 28) * 0.22 * g.scale;
  for (let i = 0; i < amount; i += 1) {
    const h = hash(i + 41);
    const a = h * TAU + t * speed;
    const r = g.radius * (0.15 + hash(i + 2) * (0.25 + spread * 1.2));
    const pulse = 1 + Math.sin(t * 2.1 + i) * pulseStrength * 0.5;
    const size = Math.max(0.6, finite(layer.particleSize, 22) * 0.08 * g.scale * (0.5 + h) * pulse);
    ctx.fillStyle = withAlpha(color, opacity * (0.18 + h * 0.4));
    ctx.beginPath();
    ctx.arc(g.x + Math.cos(a) * r * g.scaleX, g.y + Math.sin(a) * r * g.scaleY, size, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawRingStroke(ctx, g, color, opacity, thickness, glow, t, layer) {
  if (opacity <= 0) return;
  const outlineRadius = clamp(finite(layer.outlineRadius, 100), 40, 160) / 100;
  const pulse = 1 + Math.sin(t * shimmerSpeed(layer, finite(layer.outlinePulseSpeed, 48) * 0.06)) * percent100(layer.outlinePulseStrength, 18) * 0.08;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = withAlpha(color, opacity);
  ctx.shadowColor = color;
  ctx.shadowBlur = glow;
  ctx.lineWidth = Math.max(0.5, thickness);
  ctx.beginPath();
  ctx.ellipse(g.x, g.y, g.radius * pulse * g.scaleX * outlineRadius, g.radius * pulse * g.scaleY * outlineRadius, 0, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawAperture(ctx, layer, g, core, middleAlpha, pulse) {
  const width = Math.max(0.02, finite(layer.apertureWidth, 18) / 24);
  const height = Math.max(0.02, finite(layer.apertureHeight, 16) / 18);
  const opacity = percent100(layer.apertureOpacity, 72);
  const softness = percent100(layer.apertureSoftness, 58);
  const offsetX = finite(layer.apertureOffsetX, 0) / 100 * g.radius;
  const offsetY = finite(layer.apertureOffsetY, 0) / 100 * g.radius;
  const x = g.x + offsetX;
  const y = g.y + offsetY;
  const aperture = ctx.createRadialGradient(x, y, 0, x, y, g.radius * Math.max(width, height) * 1.05);
  aperture.addColorStop(0, withAlpha(layer.middleColor || '#0b1731', opacity * middleAlpha));
  aperture.addColorStop(Math.min(0.9, 0.35 + softness * 0.45), withAlpha(core, opacity * middleAlpha * 0.24));
  aperture.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aperture;
  ctx.beginPath();
  ctx.ellipse(x, y, g.radius * width * 0.72 * g.scaleX * pulse, g.radius * height * 0.62 * g.scaleY * pulse, finite(layer.apertureRotation, 0) * Math.PI / 180, 0, TAU);
  ctx.fill();
  const rimGlow = percent100(layer.apertureRimGlowOpacity, 24);
  if (rimGlow > 0) drawRingStroke(ctx, { ...g, x, y, radius: g.radius * Math.max(width, height) * 0.7 }, core, rimGlow, Math.max(0.4, finite(layer.apertureRimGlow, 18) * 0.035 * g.scale), finite(layer.apertureRimGlowSize, 40) * 0.22 * g.scale, 0, { outlineRadius: 100, outlinePulseStrength: 0, outlinePulseSpeed: 0 });
}

function drawChromaticEcho(ctx, layer, g, t) {
  const split = percent100(layer.chromatic, 0);
  if (split <= 0) return;
  const offset = split * 12 * g.scale;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.lineWidth = Math.max(0.5, 1.1 * g.scale);
  ctx.shadowBlur = 4 * g.scale;
  ctx.strokeStyle = withAlpha('#00eaff', 0.12 + split * 0.16);
  ctx.beginPath();
  ctx.ellipse(g.x - offset, g.y, g.radius * g.scaleX, g.radius * g.scaleY, 0, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = withAlpha('#ff2aff', 0.12 + split * 0.16);
  ctx.beginPath();
  ctx.ellipse(g.x + offset, g.y, g.radius * g.scaleX, g.radius * g.scaleY, 0, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawOverlayPlaceholder(ctx, layer, g, t, slot) {
  const enabled = slot === 2 ? layer.overlay2Enabled : layer.overlayEnabled;
  if (!enabled) return;
  const opacity = percent100(slot === 2 ? layer.overlay2Opacity : layer.overlayOpacity, slot === 2 ? 55 : 62);
  const overlayScale = clamp(finite(slot === 2 ? layer.overlay2Scale : layer.overlayScale, 100), 10, 220) / 100;
  const speed = finite(slot === 2 ? layer.overlay2RotationSpeed : layer.overlayRotationSpeed, slot === 2 ? 0 : 12) * 0.018;
  const color = slot === 2 ? layer.accentColor || '#ffca66' : layer.coreColor || '#32f1ff';
  ctx.save();
  ctx.globalCompositeOperation = slot === 2 ? 'screen' : 'lighter';
  ctx.strokeStyle = withAlpha(color, opacity * 0.35);
  ctx.shadowColor = color;
  ctx.shadowBlur = 14 * g.scale;
  ctx.lineWidth = Math.max(0.5, 1.4 * g.scale);
  ctx.translate(g.x, g.y);
  ctx.rotate(t * speed);
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const a = i / 8 * TAU;
    const r = g.radius * overlayScale * (0.32 + (i % 2) * 0.18);
    const x = Math.cos(a) * r * g.scaleX;
    const y = Math.sin(a) * r * g.scaleY;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function shimmerGeometry(layer, scale, stageWidth, stageHeight) {
  const fallbackX = finite(layer.emitterX, stageWidth * 0.5) / stageWidth * 100;
  const fallbackY = finite(layer.emitterY, stageHeight * 0.5) / stageHeight * 100;
  const x = percentPoint(layer.positionX, fallbackX, stageWidth) * scale;
  const y = percentPoint(layer.positionY, fallbackY, stageHeight) * scale;
  const baseRadius = Math.min(stageWidth, stageHeight) * 0.33 * scale;
  const radius = baseRadius * clamp(finite(layer.radius, 50), 4, 120) / 100 * clamp(finite(layer.renderScale, 100), 20, 220) / 100;
  return {
    x,
    y,
    radius,
    scale,
    scaleX: clamp(finite(layer.scaleX, 100), 5, 260) / 100,
    scaleY: clamp(finite(layer.scaleY, 100), 5, 260) / 100
  };
}

function modeToType(mode) {
  if (mode === 'wormhole-tunnel') return 'wormhole';
  if (mode === 'heat-shimmer') return 'heat';
  if (mode === 'transition-tear') return 'transition';
  return 'ring';
}

function softBlob(ctx, x, y, radius, color, alpha) {
  if (radius <= 0 || alpha <= 0) return;
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, withAlpha(color, alpha));
  gradient.addColorStop(0.55, withAlpha(color, alpha * 0.38));
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fill();
}

function smokeSpeed(layer, fallback) {
  const duration = clamp(finite(layer.duration, 8.6), 1, 24);
  return fallback * (8.6 / duration);
}

function shimmerSpeed(layer, fallback) {
  const duration = clamp(finite(layer.durationSec, 8), 1, 20);
  const intensity = percent100(layer.loopIntensity, 60);
  return fallback * (8 / duration) * (0.35 + intensity * 1.35);
}

function unitValue(value, fallback) {
  const number = finite(value, fallback);
  if (number > 1) return clamp(number / 100, 0, 1);
  return clamp(number, 0, 1);
}

function percentPoint(value, fallback, full) {
  return clamp(finite(value, fallback), 0, 100) / 100 * full;
}

function percent100(value, fallback) {
  return clamp(finite(value, fallback), 0, 100) / 100;
}

function withAlpha(color, alpha) {
  const rgba = parseColor(color);
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${clamp(alpha, 0, 1)})`;
}

function parseColor(color) {
  const string = String(color || '').trim();
  const hex = string.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/iu);
  if (!hex) return { r: 255, g: 255, b: 255 };
  let value = hex[1];
  if (value.length === 3) value = value.split('').map((char) => char + char).join('');
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

function hash(value) {
  const x = Math.sin((Number(value) || 0) * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

function finite(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
