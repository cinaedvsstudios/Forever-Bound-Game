const textureCache = new Map();

export class Particle {
  constructor(layer, burstAngle = null) {
    const emitterRotation = finite(layer.emitterRotation, 0);
    const angle = degreesToRadians(emitterRotation + (burstAngle ?? randomRange(layer.angle - layer.spread / 2, layer.angle + layer.spread / 2)));
    const speed = randomRange(layer.speedMin, layer.speedMax);
    const jitter = layer.engine === 'gas' || layer.engine === 'refraction' ? 28 : 7;
    const emitterWidth = resolveEmitterWidth(layer);
    const widthOffset = randomRange(-emitterWidth / 2, emitterWidth / 2);
    const widthAngle = degreesToRadians(emitterRotation + 90);

    this.x = layer.emitterX + Math.cos(widthAngle) * widthOffset + randomRange(-jitter, jitter);
    this.y = layer.emitterY + Math.sin(widthAngle) * widthOffset + randomRange(-jitter, jitter);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.age = 0;
    this.life = Math.max(4, randomRange(finite(layer.lifetimeMin, layer.lifetime * 0.75), finite(layer.lifetimeMax, layer.lifetime * 1.25)));
    this.rotation = randomRange(0, Math.PI * 2);
    this.rotationSpeed = randomRange(-0.05, 0.05);
    this.seed = Math.random();
  }

  update(layer) {
    this.age += 1;
    this.vy += layer.gravity;
    applyTargetForces(this, layer);
    if (layer.engine === 'gas' || layer.engine === 'refraction') {
      this.vx += Math.sin((this.age + this.seed * 30) * 0.04) * 0.025;
      this.vy *= 0.992;
      this.vx *= 0.995;
    }
    if (layer.engine === 'ribbon' || layer.engine === 'lensflare') {
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

export function spawnParticlesForLayer(layer) {
  if (!layer.visible) return [];
  const spawnRate = Math.max(0, Number(layer.spawnRate) || 0);
  const count = Math.floor(spawnRate / 4);
  const chance = (spawnRate / 4) - count;
  const total = count + (Math.random() < chance ? 1 : 0);

  const particles = [];
  if (layer.engine === 'ring') {
    const ringTotal = Math.max(24, Math.round(spawnRate));
    for (let i = 0; i < ringTotal; i++) {
      particles.push(new Particle(layer, (360 / ringTotal) * i));
    }
    layer.spawnRate = Math.max(1, layer.spawnRate * 0.985);
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
  const color = rgbaFromHex(ramp.color, alpha);
  const x = particle.x * scale;
  const y = particle.y * scale;
  const rotation = particle.rotation + degreesToRadians(finite(layer.rotation, 0));

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

  if (layer.appearanceMode === 'custom' && layer.textureDataUrl) {
    drawTextureParticle(ctx, x, y, size, color, rotation, layer);
  } else if (layer.engine === 'lightning') {
    drawSpark(ctx, x, y, size, color, rotation);
  } else if (layer.engine === 'projectile') {
    drawProjectile(ctx, x, y, size, color, rotation);
  } else if (layer.engine === 'ribbon') {
    drawRibbonDot(ctx, x, y, size, color, rotation);
  } else if (layer.engine === 'lensflare') {
    drawLensFlare(ctx, x, y, size, color, rotation);
  } else if (layer.engine === 'refraction') {
    drawRefractionDraft(ctx, x, y, size, color, rotation);
  } else if (layer.appearanceMode === 'brush') {
    drawBuiltInBrush(ctx, x, y, size, color, rotation, layer.builtInBrush || 'spark');
  } else {
    drawShape(ctx, x, y, size, color, rotation, layer.particleShape || 'circle', layer.engine === 'gas');
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
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  if (layer.tintMode === 'original') {
    ctx.drawImage(image, -box.width / 2, -box.height / 2, box.width, box.height);
  } else if (layer.tintMode === 'alpha-mask') {
    drawTintedImage(ctx, image, -box.width / 2, -box.height / 2, box.width, box.height, color, 'source-in');
  } else {
    ctx.drawImage(image, -box.width / 2, -box.height / 2, box.width, box.height);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = color;
    ctx.fillRect(-box.width / 2, -box.height / 2, box.width, box.height);
  }

  ctx.restore();
}

function drawTintedImage(ctx, image, x, y, width, height, color, compositeMode) {
  ctx.save();
  ctx.drawImage(image, x, y, width, height);
  ctx.globalCompositeOperation = compositeMode;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
  ctx.restore();
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
  if (fit === 'cover') {
    return ratio >= 1 ? { width: base * ratio, height: base } : { width: base, height: base / ratio };
  }
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

function drawShape(ctx, x, y, size, color, rotation, shape, smoky) {
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
  return drawStar(ctx, x, y, size, color, rotation);
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
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, size * 0.22);
  ctx.beginPath();
  ctx.moveTo(x - Math.cos(rotation) * size, y - Math.sin(rotation) * size);
  ctx.lineTo(x + Math.cos(rotation) * size, y + Math.sin(rotation) * size);
  ctx.stroke();
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

function drawRefractionDraft(ctx, x, y, size, color, rotation) {
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, size * 0.035);
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.65, size * 0.38, 0, 0, Math.PI * 2);
  ctx.stroke();
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
  if (/^#[0-9a-f]{3}$/iu.test(string)) {
    return `#${string.slice(1).split('').map((char) => char + char).join('')}`;
  }
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
  return engine === 'gas' || engine === 'refraction' ? 'source-over' : 'lighter';
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
