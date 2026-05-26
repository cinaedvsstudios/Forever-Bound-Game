const textureCache = new Map();

export class Particle {
  constructor(layer, burstAngle = null) {
    const emitterRotation = finite(layer.emitterRotation, 0);
    const angleDegrees = emitterRotation + (burstAngle ?? randomRange(layer.angle - layer.spread / 2, layer.angle + layer.spread / 2));
    const angle = degreesToRadians(angleDegrees);
    const speed = randomRange(layer.speedMin, layer.speedMax);
    const jitter = ['gas', 'refraction', 'heatdistortion'].includes(layer.engine) ? 28 : 7;
    const emitterWidth = resolveEmitterWidth(layer);
    const widthOffset = randomRange(-emitterWidth / 2, emitterWidth / 2);
    const widthAngle = degreesToRadians(emitterRotation + 90);

    this.x = layer.emitterX + Math.cos(widthAngle) * widthOffset + randomRange(-jitter, jitter);
    this.y = layer.emitterY + Math.sin(widthAngle) * widthOffset + randomRange(-jitter, jitter);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.age = 0;
    this.life = Math.max(4, randomRange(finite(layer.lifetimeMin, layer.lifetime * 0.75), finite(layer.lifetimeMax, layer.lifetime * 1.25)));
    this.seed = Math.random();

    if (layer.rotationMode === 'fixed') {
      const jitterDegrees = finite(layer.rotationJitter, 5);
      this.rotation = degreesToRadians(finite(layer.rotation, 0) + randomRange(-jitterDegrees, jitterDegrees));
      this.rotationSpeed = 0;
    } else {
      this.rotation = randomRange(0, Math.PI * 2);
      this.rotationSpeed = randomRange(-0.05, 0.05);
    }
  }

  update(layer) {
    this.age += 1;
    this.vy += layer.gravity;
    applyTargetForces(this, layer);
    if (['gas', 'refraction', 'heatdistortion'].includes(layer.engine)) {
      this.vx += Math.sin((this.age + this.seed * 30) * 0.04) * 0.025;
      this.vy *= 0.992;
      this.vx *= 0.995;
    }
    if (['ribbon', 'lensflare', 'true-lensflare'].includes(layer.engine)) {
      this.vx *= 0.988;
      this.vy *= 0.988;
    }
    const friction = Math.min(0.08, Math.max(0, finite(layer.friction, 0)));
    if (friction > 0) {
      this.vx *= 1 - friction;
      this.vy *= 1 - friction;
    }
    const noise = Math.max(0, finite(layer.noiseGrain, 0));
    if (noise > 0) {
      this.vx += (Math.random() - 0.5) * noise * 0.7;
      this.vy += (Math.random() - 0.5) * noise * 0.7;
    }
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
  }

  get alive() {
    return this.age < this.life;
  }
}

export function spawnParticlesForLayer(layer, densityScale = 1) {
  if (!layer.visible) return [];
  const spawnRate = Math.max(0, (Number(layer.spawnRate) || 0) * Math.max(0, densityScale));
  const count = Math.floor(spawnRate / 4);
  const chance = (spawnRate / 4) - count;
  const total = count + (Math.random() < chance ? 1 : 0);

  const particles = [];
  if (layer.engine === 'ring') {
    const ringTotal = Math.max(12, Math.round(spawnRate));
    for (let i = 0; i < ringTotal; i++) {
      particles.push(new Particle(layer, (360 / ringTotal) * i));
    }
    layer.spawnRate = Math.max(1, layer.spawnRate * 0.985);
    return particles;
  }
  if (layer.engine === 'shockwave') {
    if (Math.random() < Math.max(0.02, spawnRate / 24)) particles.push(new Particle(layer, 0));
    return particles;
  }
  if (layer.engine === 'true-lensflare') {
    if (Math.random() < Math.max(0.02, spawnRate / 36)) particles.push(new Particle(layer, 0));
    return particles;
  }

  for (let i = 0; i < total; i++) {
    particles.push(new Particle(layer));
  }
  return particles;
}

export function drawParticle(ctx, particle, layer, scale) {
  const t = Math.min(1, particle.age / particle.life);
  const ramp = sampleAppearanceRamp(layer, easeOut(t));
  const alpha = ramp.opacity * finite(layer.textureAlpha, 1);
  if (alpha <= 0.005) return;

  const size = Math.max(0.5, ramp.size) * scale;
  const color = rgbaFromHex(ramp.color, 1);
  const x = particle.x * scale;
  const y = particle.y * scale;
  const rotation = particle.rotation;

  ctx.save();
  ctx.globalCompositeOperation = layer.blendMode || defaultBlendMode(layer.engine);
  ctx.globalAlpha = alpha;

  if (ramp.glow > 0) {
    ctx.shadowBlur = ramp.glow * scale;
    ctx.shadowColor = ramp.color;
  }
  if (layer.edgeBlur > 0) {
    ctx.filter = `blur(${Math.min(30, layer.edgeBlur) * scale}px)`;
  }

  if (layer.engine === 'electric-arc' || layer.engine === 'lightning') {
    drawElectricArc(ctx, x, y, size, color, rotation, layer, particle, scale);
  } else if (layer.engine === 'shockwave') {
    drawShockwave(ctx, x, y, ramp, t, layer, scale);
  } else if (layer.engine === 'true-lensflare') {
    drawTrueLensFlare(ctx, x, y, ramp, t, layer, scale);
  } else if (layer.appearanceMode === 'custom' && layer.textureDataUrl) {
    drawTextureParticle(ctx, x, y, size, color, rotation, layer);
  } else if (layer.engine === 'projectile') {
    drawProjectile(ctx, x, y, size, color, rotation);
  } else if (layer.engine === 'ribbon') {
    drawRibbonDot(ctx, x, y, size, color, rotation);
  } else if (layer.engine === 'lensflare') {
    drawLensFlare(ctx, x, y, size, color, rotation);
  } else if (layer.engine === 'refraction') {
    drawRefractionDraft(ctx, x, y, size, color, rotation);
  } else if (layer.engine === 'heatdistortion') {
    drawHeatHazeParticle(ctx, x, y, size, color, rotation, layer, particle, scale);
  } else if (layer.appearanceMode === 'brush') {
    drawBuiltInBrush(ctx, x, y, size, color, rotation, layer.builtInBrush || 'spark');
  } else {
    drawShape(ctx, x, y, size, color, rotation, layer.particleShape || 'circle', layer.engine === 'gas', layer);
  }

  ctx.restore();
}

export function drawHeatDistortionLayer(ctx, layer, scale, time) {
  if (!layer?.visible || layer.engine !== 'heatdistortion') return;
  const x = finite(layer.emitterX, 640) * scale;
  const y = finite(layer.emitterY, 360) * scale;
  const strength = finite(layer.distortionStrength, 12) * scale;
  const radius = finite(layer.sizeEnd, 140) * scale;
  const strips = 18;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.14;
  ctx.strokeStyle = rgbaFromHex(layer.colorA || '#fff0b6', 0.55);
  ctx.lineWidth = Math.max(1, 2 * scale);
  for (let i = 0; i < strips; i++) {
    const yy = y - radius + (i / Math.max(1, strips - 1)) * radius * 2;
    const width = Math.cos((i / strips - 0.5) * Math.PI) * radius;
    const offset = Math.sin(time * 0.004 + i * 1.7) * strength;
    ctx.beginPath();
    ctx.moveTo(x - width + offset, yy);
    ctx.bezierCurveTo(x - width * 0.3 - offset, yy - 8 * scale, x + width * 0.25 + offset, yy + 8 * scale, x + width - offset, yy);
    ctx.stroke();
  }
  ctx.restore();
}

function sampleAppearanceRamp(layer, t) {
  const stops = getAppearanceStops(layer);
  if (stops.length === 1) return stops[0];
  const sampleT = layer.reverseColor ? 1 - t : t;
  let left = stops[0];
  let right = stops[stops.length - 1];
  for (let index = 0; index < stops.length - 1; index += 1) {
    if (sampleT >= stops[index].position && sampleT <= stops[index + 1].position) {
      left = stops[index];
      right = stops[index + 1];
      break;
    }
  }
  const span = Math.max(0.0001, right.position - left.position);
  const localT = Math.min(1, Math.max(0, (sampleT - left.position) / span));
  return {
    color: mixHexRaw(left.color, right.color, localT),
    opacity: lerp(left.opacity, right.opacity, localT),
    size: lerp(left.size, right.size, localT),
    glow: lerp(left.glow, right.glow, localT)
  };
}

function getAppearanceStops(layer) {
  if (Array.isArray(layer.appearanceStops) && layer.appearanceStops.length) {
    return layer.appearanceStops
      .map((stop, index) => ({
        position: Math.min(1, Math.max(0, finite(stop.position, index))),
        color: normalizeHex(stop.color || layer.colorA || '#ffcc66'),
        opacity: Math.min(1, Math.max(0, finite(stop.opacity, index === 0 ? layer.alphaStart : layer.alphaEnd))),
        size: Math.max(0.5, finite(stop.size, index === 0 ? layer.sizeStart : layer.sizeEnd)),
        glow: Math.max(0, finite(stop.glow, index === 0 ? layer.glow : 0))
      }))
      .sort((a, b) => a.position - b.position);
  }
  return [
    { position: 0, color: layer.colorA || '#ffcc66', opacity: finite(layer.alphaStart, 1), size: finite(layer.sizeStart, 20), glow: finite(layer.glow, 12) },
    { position: 1, color: layer.colorB || '#ff6600', opacity: finite(layer.alphaEnd, 0), size: finite(layer.sizeEnd, 4), glow: 0 }
  ];
}

function drawTextureParticle(ctx, x, y, size, color, rotation, layer) {
  const image = getTextureImage(layer.textureDataUrl);
  if (!image?.complete || !image.naturalWidth) {
    drawBuiltInBrush(ctx, x, y, size, color, rotation, 'soft-dot');
    return;
  }
  const box = getTextureDrawBox(image, size, layer.textureFit || 'contain');
  const brush = renderBrushToCanvas(image, box.width, box.height, color, layer.tintMode || 'tint');
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.drawImage(brush, -box.width / 2, -box.height / 2, box.width, box.height);
  ctx.restore();
}

function renderBrushToCanvas(image, width, height, color, tintMode) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(width));
  canvas.height = Math.max(1, Math.ceil(height));
  const brushCtx = canvas.getContext('2d');
  brushCtx.clearRect(0, 0, canvas.width, canvas.height);
  brushCtx.drawImage(image, 0, 0, canvas.width, canvas.height);
  if (tintMode === 'original') return canvas;
  brushCtx.globalCompositeOperation = tintMode === 'alpha-mask' ? 'source-in' : 'source-atop';
  brushCtx.fillStyle = color;
  brushCtx.fillRect(0, 0, canvas.width, canvas.height);
  brushCtx.globalCompositeOperation = 'source-over';
  return canvas;
}

function getTextureImage(src) {
  if (!src) return null;
  if (textureCache.has(src)) return textureCache.get(src);
  const image = new Image();
  image.src = src;
  textureCache.set(src, image);
  return image;
}

function getTextureDrawBox(image, size, fit) {
  const base = Math.max(1, size * 2);
  if (fit === 'stretch') return { width: base, height: base };
  const ratio = image.naturalWidth / Math.max(1, image.naturalHeight);
  if (fit === 'cover') return ratio >= 1 ? { width: base * ratio, height: base } : { width: base, height: base / ratio };
  return ratio >= 1 ? { width: base, height: base / ratio } : { width: base * ratio, height: base };
}

function resolveEmitterWidth(layer) {
  const width = finite(layer.emitterWidth, 0);
  if (layer.emitterWidthUnit === 'percent') {
    const stageWidth = finite(layer.designWidth, finite(globalThis.ArtifexDesignWidth, 1280));
    return Math.max(0, width / 100 * stageWidth);
  }
  return Math.max(0, width);
}

function applyTargetForces(particle, layer) {
  const orbitalForce = finite(layer.orbitalForce, 0);
  if (!orbitalForce && !layer.reverseNearTarget) return;
  const dx = finite(layer.targetX, 640) - particle.x;
  const dy = finite(layer.targetY, 360) - particle.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const nx = dx / distance;
  const ny = dy / distance;
  if (orbitalForce) {
    particle.vx += -ny * orbitalForce;
    particle.vy += nx * orbitalForce;
  }
  if (layer.reverseNearTarget && distance < 96) {
    particle.vx -= nx * 0.08;
    particle.vy -= ny * 0.08;
  }
}

function drawShape(ctx, x, y, size, color, rotation, shape, smoky, layer) {
  if (shape === 'text') return drawTextShape(ctx, x, y, size, color, rotation, layer);
  if (shape === 'square') return drawSquare(ctx, x, y, size, color, rotation);
  if (shape === 'diamond') return drawDiamond(ctx, x, y, size, color, rotation);
  if (shape === 'star') return drawStar(ctx, x, y, size, color, rotation);
  if (shape === 'slash') return drawRibbonDot(ctx, x, y, size, color, rotation);
  return drawSoftCircle(ctx, x, y, size, color, smoky);
}

function drawBuiltInBrush(ctx, x, y, size, color, rotation, brush) {
  if (brush === 'soft-dot') return drawSoftCircle(ctx, x, y, size, color, false);
  if (brush === 'smoke-puff') return drawSoftCircle(ctx, x, y, size * 1.25, color, true);
  if (brush === 'slash') return drawRibbonDot(ctx, x, y, size, color, rotation);
  if (brush === 'flare') return drawLensFlare(ctx, x, y, size, color, rotation);
  return drawSpark(ctx, x, y, size, color, rotation);
}

function drawSoftCircle(ctx, x, y, size, color, smoky) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.55, color.replace(/[\d.]+\)$/u, '0.35)'));
  gradient.addColorStop(1, color.replace(/[\d.]+\)$/u, '0)'));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  if (smoky) {
    ctx.fillStyle = color.replace(/[\d.]+\)$/u, '0.15)');
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(x + Math.cos(i * 2.1) * size * 0.35, y + Math.sin(i * 2.1) * size * 0.35, size * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawSquare(ctx, x, y, size, color, rotation) {
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = color;
  ctx.fillRect(-size * 0.55, -size * 0.55, size * 1.1, size * 1.1);
}

function drawDiamond(ctx, x, y, size, color, rotation) {
  ctx.translate(x, y);
  ctx.rotate(rotation + Math.PI / 4);
  ctx.fillStyle = color;
  ctx.fillRect(-size * 0.48, -size * 0.48, size * 0.96, size * 0.96);
}

function drawStar(ctx, x, y, size, color, rotation) {
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? size : size * 0.38;
    const angle = (Math.PI * 2 * i) / 10 - Math.PI / 2;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawSpark(ctx, x, y, size, color, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, size * 0.22);
  ctx.beginPath();
  ctx.moveTo(-size, 0);
  ctx.lineTo(size, 0);
  ctx.stroke();
  ctx.restore();
}

function drawProjectile(ctx, x, y, size, color, rotation) {
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.3, size * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawRibbonDot(ctx, x, y, size, color, rotation) {
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(-size * 0.85, -size * 0.22, size * 1.7, size * 0.44, size * 0.2);
  ctx.fill();
}

function drawTextShape(ctx, x, y, size, color, rotation, layer) {
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.font = `${layer.textWeight || '700'} ${Math.max(8, size)}px ${layer.textFont || 'Cinzel, Georgia, serif'}`;
  ctx.textAlign = layer.textAlign || 'center';
  ctx.textBaseline = 'middle';
  const text = String(layer.textContent || 'AETHERA');
  if (layer.textStroke) {
    ctx.lineWidth = Math.max(0.5, finite(layer.textStrokeWidth, 2));
    ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    ctx.strokeText(text, 0, 0);
  }
  ctx.fillStyle = color;
  ctx.fillText(text, 0, 0);
}

function drawElectricArc(ctx, x, y, size, color, rotation, layer, particle, scale) {
  const length = finite(layer.arcLength, 82) * scale;
  const jag = finite(layer.arcJaggedness, 18) * scale;
  const segments = Math.max(4, Math.round(length / Math.max(10, 16 * scale)));
  const flicker = finite(layer.arcFlicker, 0.7);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, size * 0.25);
  ctx.globalAlpha *= 0.75 + Math.random() * flicker * 0.35;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let i = 1; i <= segments; i++) {
    const px = (i / segments) * length;
    const py = (Math.sin(i * 12.989 + particle.seed * 90 + particle.age * 0.7) * 0.5 + Math.random() - 0.5) * jag;
    ctx.lineTo(px, py);
  }
  ctx.stroke();
  const branches = Math.max(0, Math.round(finite(layer.arcBranches, 3)));
  ctx.lineWidth *= 0.55;
  for (let b = 0; b < branches; b++) {
    const start = randomRange(length * 0.18, length * 0.82);
    const side = Math.random() < 0.5 ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(start, Math.sin(start + particle.seed) * jag * 0.3);
    ctx.lineTo(start + randomRange(12, 38) * scale, side * randomRange(12, 34) * scale);
    ctx.stroke();
  }
  ctx.restore();
}

function drawShockwave(ctx, x, y, ramp, t, layer, scale) {
  const radius = lerp(4, finite(layer.shockwaveRadius, 245), easeOut(t)) * scale;
  const thickness = Math.max(1, finite(layer.shockwaveThickness, 9) * scale * (1 - t * 0.6));
  ctx.save();
  ctx.strokeStyle = rgbaFromHex(ramp.color, Math.max(0, 1 - t));
  ctx.lineWidth = thickness;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  const flash = finite(layer.shockwaveCenterFlash, 0.28) * (1 - t);
  if (flash > 0.02) drawSoftCircle(ctx, x, y, radius * 0.18, rgbaFromHex(ramp.color, flash), false);
  ctx.restore();
}

function drawLensFlare(ctx, x, y, size, color, rotation) {
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1, size * 0.08);
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-size * 1.4, 0);
  ctx.lineTo(size * 1.4, 0);
  ctx.moveTo(0, -size * 1.4);
  ctx.lineTo(0, size * 1.4);
  ctx.stroke();
}

function drawTrueLensFlare(ctx, x, y, ramp, t, layer, scale) {
  const color = rgbaFromHex(ramp.color, 1);
  const halo = finite(layer.flareHalo, 72) * scale;
  const streak = finite(layer.flareStreakLength, 320) * scale;
  const ghosts = Math.max(0, Math.round(finite(layer.flareGhosts, 4)));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(degreesToRadians(finite(layer.rotation, 0)));
  drawSoftCircle(ctx, 0, 0, halo * 0.55, color, false);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, 3 * scale);
  ctx.beginPath();
  ctx.moveTo(-streak / 2, 0);
  ctx.lineTo(streak / 2, 0);
  ctx.stroke();
  ctx.lineWidth = Math.max(1, 1.5 * scale);
  ctx.beginPath();
  ctx.moveTo(0, -halo * 1.15);
  ctx.lineTo(0, halo * 1.15);
  ctx.stroke();
  for (let i = 1; i <= ghosts; i++) {
    const gx = (i / (ghosts + 1) - 0.5) * streak * 1.15;
    ctx.globalAlpha *= 0.82;
    drawSoftCircle(ctx, gx, 0, halo * (0.12 + i * 0.035), color, false);
  }
  ctx.restore();
}

function drawRefractionDraft(ctx, x, y, size, color, rotation) {
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, size * 0.035);
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.65, size * 0.38, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawHeatHazeParticle(ctx, x, y, size, color, rotation, layer, particle, scale) {
  ctx.translate(x, y);
  ctx.rotate(rotation + Math.sin(particle.age * 0.05) * 0.2);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, size * 0.03);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const yy = (i - 1) * size * 0.25;
    ctx.moveTo(-size * 0.45, yy);
    ctx.bezierCurveTo(-size * 0.12, yy - size * 0.15, size * 0.14, yy + size * 0.15, size * 0.45, yy);
    ctx.stroke();
  }
}

export function mixHex(a, b, t, alpha = 1) {
  return rgbaFromHex(mixHexRaw(a, b, t), alpha);
}

function mixHexRaw(a, b, t) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const r = Math.round(lerp(ca.r, cb.r, t));
  const g = Math.round(lerp(ca.g, cb.g, t));
  const blue = Math.round(lerp(ca.b, cb.b, t));
  return `#${toHex(r)}${toHex(g)}${toHex(blue)}`;
}

function rgbaFromHex(hex, alpha = 1) {
  const rgb = hexToRgb(hex);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function toHex(value) {
  return Math.max(0, Math.min(255, value)).toString(16).padStart(2, '0');
}

function normalizeHex(value) {
  const string = String(value || '').trim();
  if (/^#[0-9a-f]{6}$/iu.test(string)) return string;
  if (/^#[0-9a-f]{3}$/iu.test(string)) return `#${string.slice(1).split('').map((char) => char + char).join('')}`;
  return '#ffcc66';
}

function hexToRgb(hex) {
  const normalized = normalizeHex(hex).replace('#', '').trim();
  const number = Number.parseInt(normalized, 16);
  return {
    r: (number >> 16) & 255,
    g: (number >> 8) & 255,
    b: number & 255
  };
}

function defaultBlendMode(engine) {
  return ['gas', 'refraction', 'heatdistortion'].includes(engine) ? 'source-over' : 'lighter';
}

function finite(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 2);
}

function lerp(a, b, t) {
  return Number(a) + (Number(b) - Number(a)) * t;
}

function randomRange(min, max) {
  return Number(min) + Math.random() * (Number(max) - Number(min));
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}
