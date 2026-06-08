const TAU = Math.PI * 2;

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value)));
const clamp01 = (value) => clamp(value, 0, 1);
const scale = (min, max, value) => min + (max - min) * clamp01(value);
const fract = (value) => value - Math.floor(value);
const hash1 = (value) => fract(Math.sin(value * 127.1) * 43758.5453123);
const hash2 = (x, y) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
const smoothstep = (edge0, edge1, value) => {
  const t = clamp01((value - edge0) / Math.max(0.0001, edge1 - edge0));
  return t * t * (3 - 2 * t);
};

function hexToRgb(hex) {
  const safe = String(hex || '#ffffff').replace('#', '').trim();
  const full = safe.length === 3 ? safe.split('').map((char) => char + char).join('') : safe.padEnd(6, '0').slice(0, 6);
  const value = Number.parseInt(full, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function rgba(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function cover(imageWidth, imageHeight, targetWidth, targetHeight) {
  const imageRatio = imageWidth / Math.max(1, imageHeight);
  const targetRatio = targetWidth / Math.max(1, targetHeight);
  let width = targetWidth;
  let height = targetHeight;
  if (imageRatio > targetRatio) {
    height = targetHeight;
    width = height * imageRatio;
  } else {
    width = targetWidth;
    height = width / imageRatio;
  }
  return { x: (targetWidth - width) / 2, y: (targetHeight - height) / 2, width, height };
}

export class ShimmerDistortionEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gridCanvas = document.createElement('canvas');
    this.grid = this.gridCanvas.getContext('2d');
    this.textureImage = null;
    this.values = {};
    this.gridKey = '';
  }

  setValues(values) {
    this.values = { ...values };
  }

  setTextureImage(image = null) {
    this.textureImage = image;
  }

  resize() {
    const ratio = Math.max(1, Math.min(1.6, window.devicePixelRatio || 1));
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(720, Math.round(rect.width * ratio));
    const height = Math.max(405, Math.round(rect.height * ratio));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.gridCanvas.width = width;
      this.gridCanvas.height = height;
      this.gridKey = '';
    }
  }

  geometry(timeSec) {
    const v = this.values;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const base = Math.min(width, height) * scale(0.08, 0.62, (v.radius ?? 60) / 100);
    const pulse = 1 + Math.sin(timeSec * scale(0.4, 4, (v.pulse ?? 45) / 100)) * 0.035 * ((v.loopIntensity ?? 50) / 100);
    return {
      w: width,
      h: height,
      cx: width * ((v.positionX ?? 50) / 100),
      cy: height * ((v.positionY ?? 50) / 100),
      base,
      rx: Math.max(0.01, base * ((v.scaleX ?? 100) / 100) * pulse),
      ry: Math.max(0.01, base * ((v.scaleY ?? 100) / 100) * pulse)
    };
  }

  draw(timeSec = 0) {
    this.resize();
    const g = this.geometry(timeSec);
    const v = this.values;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, g.w, g.h);
    ctx.fillStyle = v.backdropColor || '#09080f';
    ctx.fillRect(0, 0, g.w, g.h);

    if (v.showGrid) this.drawGrid(g);
    this.drawShimmer(ctx, g, timeSec);

    if (v.type === 'heat') {
      this.drawHeat(ctx, g, timeSec);
    } else if (v.type === 'wormhole') {
      this.drawWormhole(ctx, g, timeSec);
    } else if (v.type === 'transition') {
      this.drawTransition(ctx, g, timeSec);
    } else {
      this.drawPortalRing(ctx, g, timeSec);
    }
  }

  drawGrid(g) {
    const v = this.values;
    const key = `${g.w}x${g.h}|${v.coreColor}|${v.rimColor}|${v.accentColor}|${v.backdropColor}`;
    if (this.gridKey !== key) {
      this.gridKey = key;
      const ctx = this.grid;
      ctx.clearRect(0, 0, g.w, g.h);
      const major = Math.max(34, Math.round(g.w / 16));
      const minor = Math.max(17, Math.round(g.w / 32));
      ctx.lineWidth = Math.max(1, g.w / 900);
      for (let x = 0; x <= g.w; x += minor) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, g.h);
        ctx.strokeStyle = x % major === 0 ? rgba(v.coreColor, 0.18) : rgba(v.coreColor, 0.055);
        ctx.stroke();
      }
      for (let y = 0; y <= g.h; y += minor) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(g.w, y);
        ctx.strokeStyle = y % major === 0 ? rgba(v.rimColor, 0.14) : rgba(v.rimColor, 0.045);
        ctx.stroke();
      }
    }
    this.ctx.drawImage(this.gridCanvas, 0, 0);
  }

  drawShimmer(ctx, g, timeSec) {
    const v = this.values;
    const strength = scale(0, 0.24, (v.strength ?? 50) / 100);
    const refraction = scale(0, 0.16, (v.refraction ?? 50) / 100);
    const waveSize = scale(0.006, 0.08, (v.waveSize ?? 40) / 100);
    const waveSpeed = scale(0.15, 4.8, (v.waveSpeed ?? 40) / 100);
    const softness = scale(0.06, 0.55, (v.softness ?? 50) / 100);
    const step = v.type === 'heat' ? Math.max(4, Math.round(g.h / 90)) : Math.max(6, Math.round(g.h / 150));

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let y = 0; y < g.h; y += step) {
      const ny = (y - g.cy) / Math.max(1, g.ry);
      for (let x = 0; x < g.w; x += step * 2) {
        const nx = (x - g.cx) / Math.max(1, g.rx);
        const distance = Math.sqrt(nx * nx + ny * ny);
        const mask = v.type === 'heat'
          ? Math.max(0, 1 - Math.abs(ny) * 0.9)
          : 1 - smoothstep(1 - softness, 1.08, distance);
        if (mask <= 0.01) continue;
        const wave = v.type === 'heat'
          ? Math.sin(y * waveSize * 2.8 + timeSec * waveSpeed * 2.2)
          : Math.sin(distance / waveSize + timeSec * waveSpeed + Math.atan2(ny, nx) * 3);
        const alpha = Math.max(0, (strength * 0.16 + refraction * 0.12) * mask);
        ctx.strokeStyle = rgba(v.coreColor, alpha);
        ctx.lineWidth = Math.max(1, step * 0.25);
        ctx.beginPath();
        const offset = wave * strength * step * 4 * mask;
        ctx.moveTo(x + offset, y);
        ctx.lineTo(x + step * 2 + offset, y + wave * step * 0.7);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawHeat(ctx, g, timeSec) {
    const v = this.values;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 22; i += 1) {
      const y = g.cy - g.ry * 0.9 + (i / 21) * g.ry * 1.8;
      const alpha = 0.035 + 0.04 * Math.sin(i * 0.7 + timeSec);
      ctx.strokeStyle = rgba(v.accentColor, alpha);
      ctx.lineWidth = Math.max(1, g.h / 540);
      ctx.beginPath();
      for (let x = 0; x <= g.w; x += 18) {
        const yy = y + Math.sin(x * 0.014 + timeSec * 1.6 + i * 0.4) * g.ry * 0.035;
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  drawPortalRing(ctx, g, timeSec) {
    const v = this.values;
    this.drawDarkAperture(ctx, g);
    this.drawElectricRing(ctx, g, timeSec);
    this.drawWisps(ctx, g, timeSec, 0.82);
    this.drawParticles(ctx, g, timeSec, 0.85);
    this.drawGlow(ctx, g, 0.34);
  }

  drawDarkAperture(ctx, g) {
    const v = this.values;
    ctx.save();
    const outer = ctx.createRadialGradient(g.cx, g.cy, g.base * 0.08, g.cx, g.cy, Math.max(g.rx, g.ry) * 1.25);
    outer.addColorStop(0, rgba(v.coreColor, 0.05));
    outer.addColorStop(0.46, rgba(v.coreColor, 0.025));
    outer.addColorStop(0.78, rgba(v.rimColor, 0.04));
    outer.addColorStop(1, rgba(v.rimColor, 0));
    ctx.fillStyle = outer;
    ctx.beginPath();
    ctx.ellipse(g.cx, g.cy, g.rx * 1.16, g.ry * 1.12, 0, 0, TAU);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(g.cx, g.cy, g.rx * 0.62, g.ry * 0.70, 0, 0, TAU);
    ctx.clip();
    const dark = ctx.createRadialGradient(g.cx, g.cy, g.base * 0.05, g.cx, g.cy, Math.max(g.rx, g.ry) * 0.72);
    dark.addColorStop(0, rgba('#030407', 0.86));
    dark.addColorStop(0.55, rgba('#071018', 0.62));
    dark.addColorStop(1, rgba('#020309', 0.92));
    ctx.fillStyle = dark;
    ctx.fillRect(g.cx - g.rx, g.cy - g.ry, g.rx * 2, g.ry * 2);

    if (v.sourceMode === 'texture' && this.textureImage) {
      const rect = cover(this.textureImage.width, this.textureImage.height, g.rx * 1.35, g.ry * 1.42);
      ctx.globalAlpha = scale(0.12, 0.72, (v.textureStrength ?? 70) / 100);
      ctx.drawImage(this.textureImage, g.cx - g.rx * 0.675 + rect.x, g.cy - g.ry * 0.71 + rect.y, rect.width, rect.height);
    }
    ctx.restore();
  }

  drawElectricRing(ctx, g, timeSec) {
    const v = this.values;
    const ringCount = Math.round(scale(38, 128, (v.cloudiness ?? 58) / 100));
    const width = scale(6, 34, (v.rimWidth ?? 58) / 100);
    const alpha = scale(0.12, 0.78, (v.rimAlpha ?? 74) / 100);
    const speed = scale(0.15, 1.55, (v.swirl + 100) / 200);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (let layer = 0; layer < 4; layer += 1) {
      for (let i = 0; i < ringCount; i += 1) {
        const seed = i * 2.713 + layer * 19.13;
        const start = TAU * hash1(seed) + timeSec * speed * (layer % 2 ? -0.18 : 0.24);
        const length = scale(0.018, 0.13, hash1(seed + 5.1));
        if (hash1(seed + Math.floor(timeSec * 4) * 0.071) < 0.24) continue;
        const colour = i % 5 === 0 ? v.accentColor : (i % 2 === 0 ? v.coreColor : v.rimColor);
        ctx.strokeStyle = rgba(colour, alpha * scale(0.22, 0.86, hash1(seed + 6.2)) * (1 - layer * 0.12));
        ctx.lineWidth = Math.max(0.8, width * scale(0.025, 0.12, hash1(seed + 7.3)));
        ctx.shadowColor = colour;
        ctx.shadowBlur = scale(8, 34, (v.glow ?? 62) / 100);
        ctx.beginPath();
        for (let step = 0; step <= 6; step += 1) {
          const amount = step / 6;
          const angle = start + length * amount;
          const rough = (hash2(Math.cos(angle) * 11.2 + seed, Math.sin(angle) * 10.4 - seed + timeSec * 0.2) - 0.5) * width * scale(0.6, 1.9, (v.cloudiness ?? 58) / 100);
          const x = g.cx + Math.cos(angle) * (g.rx * 0.76 + rough + layer * width * 0.12);
          const y = g.cy + Math.sin(angle) * (g.ry * 0.84 + rough * 0.72 + layer * width * 0.08);
          if (step === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  drawWormhole(ctx, g, timeSec) {
    const v = this.values;
    const arms = 6;
    const streaks = Math.round(scale(52, 132, (v.cloudiness ?? 46) / 100));
    const turns = scale(2.3, 6.4, (v.swirl + 100) / 200);
    const speed = scale(0.35, 2.4, (v.waveSpeed ?? 62) / 100);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const bg = ctx.createRadialGradient(g.cx, g.cy, g.base * 0.02, g.cx, g.cy, Math.max(g.rx, g.ry) * 1.45);
    bg.addColorStop(0, rgba('#02030a', 0.85));
    bg.addColorStop(0.18, rgba(v.coreColor, 0.18));
    bg.addColorStop(0.58, rgba(v.rimColor, 0.10));
    bg.addColorStop(1, rgba(v.rimColor, 0));
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.ellipse(g.cx, g.cy, g.rx * 1.55, g.ry * 1.32, 0, 0, TAU);
    ctx.fill();

    for (let i = 0; i < streaks; i += 1) {
      const seed = i * 3.91;
      const arm = i % arms;
      const offset = (arm / arms) * TAU + hash1(seed) * 0.34;
      const colour = i % 4 === 0 ? v.accentColor : (i % 3 === 0 ? v.rimColor : v.coreColor);
      ctx.strokeStyle = rgba(colour, scale(0.045, 0.24, hash1(seed + 2.1)));
      ctx.lineWidth = scale(0.65, 2.8, hash1(seed + 4.7));
      ctx.shadowColor = colour;
      ctx.shadowBlur = scale(6, 28, (v.glow ?? 66) / 100);

      ctx.beginPath();
      const startP = hash1(seed + timeSec * 0.018) * 0.18;
      const endP = scale(0.62, 1.0, hash1(seed + 9.8));
      const steps = 42;
      for (let s = 0; s <= steps; s += 1) {
        const q = startP + (endP - startP) * (s / steps);
        const radius = Math.pow(1 - q, 1.85);
        const angle = offset + q * TAU * turns + timeSec * speed * (0.26 + hash1(seed + 6) * 0.32);
        const flicker = (hash2(Math.cos(angle) * 8 + seed, Math.sin(angle) * 9 + timeSec * 0.22) - 0.5) * g.base * 0.03;
        const x = g.cx + Math.cos(angle) * (g.rx * radius + flicker);
        const y = g.cy + Math.sin(angle) * (g.ry * radius + flicker * 0.72);
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    for (let ring = 0; ring < 9; ring += 1) {
      const radius = scale(0.08, 1.04, ring / 8);
      ctx.strokeStyle = rgba(ring % 2 ? v.rimColor : v.coreColor, 0.08 * (1 - ring / 10));
      ctx.lineWidth = Math.max(1, g.base * 0.003);
      ctx.beginPath();
      for (let s = 0; s <= 128; s += 1) {
        const angle = TAU * (s / 128);
        const wave = Math.sin(angle * 5 + timeSec * 1.2 + ring) * g.base * 0.012;
        const x = g.cx + Math.cos(angle) * (g.rx * radius + wave);
        const y = g.cy + Math.sin(angle) * (g.ry * radius + wave * 0.72);
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    const hole = ctx.createRadialGradient(g.cx, g.cy, 0, g.cx, g.cy, g.base * 0.19);
    hole.addColorStop(0, rgba('#000000', 0.92));
    hole.addColorStop(0.52, rgba('#030612', 0.72));
    hole.addColorStop(1, rgba(v.coreColor, 0));
    ctx.fillStyle = hole;
    ctx.beginPath();
    ctx.ellipse(g.cx, g.cy, g.rx * 0.16, g.ry * 0.18, 0, 0, TAU);
    ctx.fill();

    ctx.restore();
    this.drawParticles(ctx, g, timeSec, 0.5);
  }

  drawWisps(ctx, g, timeSec, multiplier = 1) {
    const v = this.values;
    const count = Math.round(scale(0, 42, (v.wispAmount ?? 42) / 100) * multiplier);
    if (!count) return;

    const speed = scale(0.14, 1.55, (v.wispSpeed ?? 58) / 100);
    const length = scale(20, 74, (v.wispSize ?? 34) / 100);
    const curl = scale(0.16, 1.85, (v.wispCurl ?? 70) / 100);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < count; i += 1) {
      const seed = i * 7.17;
      const progress = fract(timeSec * speed * 0.12 + hash1(seed));
      const angle = TAU * hash1(seed + 8) + Math.sin(timeSec * 0.55 + seed) * curl;
      const distance = scale(g.base * 0.12, g.base * 1.55, progress);
      const alpha = (0.045 + hash1(seed + 1) * 0.12) * Math.sin((1 - progress) * Math.PI) * multiplier;
      const colour = i % 2 ? v.coreColor : v.accentColor;
      ctx.strokeStyle = rgba(colour, alpha);
      ctx.lineWidth = scale(0.6, 1.7, hash1(seed + 3));
      ctx.shadowColor = colour;
      ctx.shadowBlur = scale(4, 18, hash1(seed + 4));
      ctx.beginPath();
      for (let s = 0; s <= 6; s += 1) {
        const q = s / 6;
        const aa = angle + Math.sin(q * TAU + timeSec + seed) * 0.28 * curl;
        const dd = distance - q * length;
        const x = g.cx + Math.cos(aa) * dd * (g.rx / g.base);
        const y = g.cy + Math.sin(aa) * dd * (g.ry / g.base);
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  drawParticles(ctx, g, timeSec, multiplier = 1) {
    const v = this.values;
    const count = Math.round(scale(0, 70, (v.particleAmount ?? 48) / 100) * multiplier);
    if (!count) return;

    const speed = scale(0.18, 2.7, (v.particleSpeed ?? 68) / 100);
    const spread = scale(0.12, 2.1, (v.particleSpread ?? 72) / 100);
    const sizeBase = scale(1.1, 6.2, (v.particleSize ?? 20) / 100);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < count; i += 1) {
      const seed = i * 17.17;
      const progress = fract(timeSec * speed * 0.2 + hash1(seed + 2.9));
      const angle = TAU * hash1(seed + 1.1) + Math.sin(timeSec * 0.7 + seed) * spread;
      const distance = scale(g.base * 0.06, g.base * 1.72, progress);
      const x = g.cx + Math.cos(angle) * distance * (g.rx / g.base);
      const y = g.cy + Math.sin(angle) * distance * (g.ry / g.base);
      const size = sizeBase * (1 - progress * 0.58) * (0.7 + hash1(seed + 3.6) * 0.65);
      const alpha = (0.18 + hash1(seed + 4.2) * 0.32) * Math.sin((1 - progress) * Math.PI) * multiplier;
      const colour = i % 3 === 0 ? v.accentColor : (i % 2 === 0 ? v.coreColor : v.rimColor);
      ctx.fillStyle = rgba(colour, alpha);
      ctx.shadowColor = colour;
      ctx.shadowBlur = size * 5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawTransition(ctx, g, timeSec) {
    const v = this.values;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const x0 = g.cx + Math.sin(timeSec * 3.1) * g.base * 0.035;
    const height = g.ry * 1.55;
    const width = Math.max(4, g.rx * 0.85);
    const grad = ctx.createLinearGradient(x0 - width, g.cy, x0 + width, g.cy);
    grad.addColorStop(0, rgba(v.rimColor, 0));
    grad.addColorStop(0.44, rgba(v.rimColor, 0.12));
    grad.addColorStop(0.50, rgba(v.coreColor, 0.34));
    grad.addColorStop(0.56, rgba(v.accentColor, 0.20));
    grad.addColorStop(1, rgba(v.rimColor, 0));
    ctx.fillStyle = grad;
    ctx.shadowColor = v.rimColor;
    ctx.shadowBlur = 24;
    ctx.beginPath();
    for (let i = 0; i <= 36; i += 1) {
      const q = i / 36;
      const y = g.cy - height + q * height * 2;
      const x = x0 + Math.sin(q * 20 + timeSec * 5) * width * 0.18 + (hash1(i * 2.1 + Math.floor(timeSec * 14)) - 0.5) * width * 0.25;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let i = 36; i >= 0; i -= 1) {
      const q = i / 36;
      const y = g.cy - height + q * height * 2;
      const x = x0 + width * 0.38 + Math.sin(q * 16 - timeSec * 4) * width * 0.17 + (hash1(i * 3.7 + 2) - 0.5) * width * 0.22;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    for (let i = 0; i < 34; i += 1) {
      const seed = i * 3.4;
      const y = g.cy - height + hash1(seed) * height * 2;
      const x = x0 + (hash1(seed + 1) - 0.5) * width * 2.2;
      const length = scale(g.base * 0.04, g.base * 0.22, hash1(seed + 2));
      const colour = i % 2 ? v.rimColor : v.accentColor;
      ctx.strokeStyle = rgba(colour, scale(0.07, 0.34, hash1(seed + 3)));
      ctx.lineWidth = scale(1, 3, hash1(seed + 4));
      ctx.shadowColor = colour;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (hash1(seed + 5) - 0.5) * length, y + (hash1(seed + 6) - 0.5) * length);
      ctx.stroke();
    }
    ctx.restore();
    this.drawParticles(ctx, g, timeSec, 0.8);
    this.drawGlow(ctx, g, 0.3);
  }

  drawGlow(ctx, g, multiplier = 1) {
    const v = this.values;
    const glow = scale(0, 0.34, (v.glow ?? 62) / 100) * multiplier;
    if (!glow) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const grad = ctx.createRadialGradient(g.cx, g.cy, g.base * 0.25, g.cx, g.cy, Math.max(g.rx, g.ry) * 1.75);
    grad.addColorStop(0, rgba(v.coreColor, glow * 0.05));
    grad.addColorStop(0.55, rgba(v.rimColor, glow * 0.07));
    grad.addColorStop(1, rgba(v.rimColor, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(g.cx, g.cy, g.rx * 1.55, g.ry * 1.34, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}
