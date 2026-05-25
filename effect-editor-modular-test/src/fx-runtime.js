export class Particle {
  constructor(layer, burstAngle = null) {
    const angle = degreesToRadians(burstAngle ?? randomRange(layer.angle - layer.spread / 2, layer.angle + layer.spread / 2));
    const speed = randomRange(layer.speedMin, layer.speedMax);
    const jitter = layer.engine === 'gas' || layer.engine === 'refraction' ? 28 : 7;

    this.x = layer.emitterX + randomRange(-jitter, jitter);
    this.y = layer.emitterY + randomRange(-jitter, jitter);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.age = 0;
    this.life = Math.max(4, layer.lifetime * randomRange(0.75, 1.25));
    this.rotation = randomRange(0, Math.PI * 2);
    this.rotationSpeed = randomRange(-0.05, 0.05);
    this.seed = Math.random();
  }

  update(layer) {
    this.age += 1;
    this.vy += layer.gravity;
    if (layer.engine === 'gas' || layer.engine === 'refraction') {
      this.vx += Math.sin((this.age + this.seed * 30) * 0.04) * 0.025;
      this.vy *= 0.992;
      this.vx *= 0.995;
    }
    if (layer.engine === 'ribbon' || layer.engine === 'lensflare') {
      this.vx *= 0.988;
      this.vy *= 0.988;
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
  const alpha = lerp(layer.alphaStart, layer.alphaEnd, easeOut(t));
  if (alpha <= 0.005) return;

  const size = Math.max(0.5, lerp(layer.sizeStart, layer.sizeEnd, easeOut(t))) * scale;
  const color = mixHex(layer.colorA, layer.colorB, t, alpha);
  const x = particle.x * scale;
  const y = particle.y * scale;

  ctx.save();
  ctx.globalCompositeOperation = layer.engine === 'gas' || layer.engine === 'refraction' ? 'source-over' : 'lighter';
  ctx.globalAlpha = alpha;

  if (layer.glow > 0) {
    ctx.shadowBlur = layer.glow * scale;
    ctx.shadowColor = layer.colorA;
  }

  if (layer.engine === 'lightning') {
    drawSpark(ctx, x, y, size, color, particle.rotation);
  } else if (layer.engine === 'projectile') {
    drawProjectile(ctx, x, y, size, color, particle.rotation);
  } else if (layer.engine === 'ribbon') {
    drawRibbonDot(ctx, x, y, size, color, particle.rotation);
  } else if (layer.engine === 'lensflare') {
    drawLensFlare(ctx, x, y, size, color, particle.rotation);
  } else if (layer.engine === 'refraction') {
    drawRefractionDraft(ctx, x, y, size, color, particle.rotation);
  } else {
    drawSoftCircle(ctx, x, y, size, color, layer.engine === 'gas');
  }

  ctx.restore();
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
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const r = Math.round(lerp(ca.r, cb.r, t));
  const g = Math.round(lerp(ca.g, cb.g, t));
  const blue = Math.round(lerp(ca.b, cb.b, t));
  return `rgba(${r}, ${g}, ${blue}, ${alpha})`;
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '').trim();
  const value = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized;
  const number = Number.parseInt(value, 16);
  return {
    r: (number >> 16) & 255,
    g: (number >> 8) & 255,
    b: number & 255
  };
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
