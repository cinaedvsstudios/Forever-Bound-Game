const TAU = Math.PI * 2;

function hexToRgb(hex) {
  const safe = String(hex || '#ffffff').replace('#', '').trim();
  const full = safe.length === 3 ? safe.split('').map((ch) => ch + ch).join('') : safe.padEnd(6, '0').slice(0, 6);
  const value = Number.parseInt(full, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

function rgba(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function scale(min, max, value) {
  return min + (max - min) * clamp01(value);
}

function smoothstep(edge0, edge1, value) {
  const t = clamp01((value - edge0) / Math.max(0.0001, edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function noise2(x, y) {
  const dot = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return dot - Math.floor(dot);
}

export class ShimmerDistortionEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sourceCanvas = document.createElement('canvas');
    this.sourceCanvas.width = canvas.width;
    this.sourceCanvas.height = canvas.height;
    this.source = this.sourceCanvas.getContext('2d');
    this.displaceCanvas = document.createElement('canvas');
    this.displaceCanvas.width = canvas.width;
    this.displaceCanvas.height = canvas.height;
    this.displace = this.displaceCanvas.getContext('2d');
    this.values = {};
  }

  resizeToDisplay() {
    const ratio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(640, Math.round(rect.width * ratio));
    const height = Math.max(360, Math.round(rect.height * ratio));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.sourceCanvas.width = width;
      this.sourceCanvas.height = height;
      this.displaceCanvas.width = width;
      this.displaceCanvas.height = height;
    }
  }

  setValues(values) {
    this.values = { ...values };
  }

  draw(timeSec = 0) {
    this.resizeToDisplay();
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const v = this.values;

    this.drawSource(timeSec);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = v.backdropColor || '#080808';
    ctx.fillRect(0, 0, w, h);

    this.drawDistortedCopy(timeSec);
    this.drawMaskAndGlow(timeSec);

    if (v.showGrid) this.drawForegroundGrid(timeSec);
  }

  drawSource(timeSec) {
    const ctx = this.source;
    const w = this.sourceCanvas.width;
    const h = this.sourceCanvas.height;
    const v = this.values;

    const backdrop = v.backdropColor || '#09080f';
    const core = v.coreColor || '#45d7ff';
    const rim = v.rimColor || '#8e4dff';

    ctx.clearRect(0, 0, w, h);
    const bg = ctx.createRadialGradient(w * .5, h * .45, 0, w * .5, h * .5, Math.max(w, h) * .7);
    bg.addColorStop(0, rgba(core, .12));
    bg.addColorStop(.38, rgba(backdrop, .96));
    bg.addColorStop(1, '#020202');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const major = Math.max(34, Math.round(w / 16));
    const minor = Math.max(17, Math.round(w / 32));

    ctx.lineWidth = Math.max(1, w / 900);
    for (let x = 0; x <= w; x += minor) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.strokeStyle = x % major === 0 ? rgba(core, .22) : rgba(core, .08);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += minor) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.strokeStyle = y % major === 0 ? rgba(rim, .18) : rgba(rim, .06);
      ctx.stroke();
    }

    ctx.save();
    ctx.globalAlpha = .15;
    ctx.strokeStyle = rgba(v.accentColor || '#ffc15f', .8);
    ctx.lineWidth = Math.max(1, w / 640);
    for (let i = 0; i < 7; i += 1) {
      const y = h * (.12 + i * .12) + Math.sin(timeSec * .8 + i) * h * .015;
      ctx.beginPath();
      for (let x = -20; x <= w + 20; x += 18) {
        const yy = y + Math.sin(x * .012 + timeSec * (1.2 + i * .03)) * 10;
        if (x <= -20) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  drawDistortedCopy(timeSec) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const v = this.values;

    const cx = w * (Number(v.positionX ?? 50) / 100);
    const cy = h * (Number(v.positionY ?? 50) / 100);
    const rx = Math.max(20, Math.min(w, h) * scale(.08, .62, (Number(v.radius ?? 60) / 100)) * (Number(v.scaleX ?? 100) / 100));
    const ry = Math.max(20, Math.min(w, h) * scale(.08, .62, (Number(v.radius ?? 60) / 100)) * (Number(v.scaleY ?? 100) / 100));
    const softness = scale(.06, .55, (Number(v.softness ?? 50) / 100));
    const strength = scale(0, 42, (Number(v.strength ?? 50) / 100));
    const refraction = scale(0, 26, (Number(v.refraction ?? 50) / 100));
    const waveSize = scale(.008, .09, (Number(v.waveSize ?? 40) / 100));
    const waveSpeed = scale(.15, 4.8, (Number(v.waveSpeed ?? 40) / 100));
    const swirl = scale(-2.2, 2.2, (Number(v.swirl ?? 0) + 100) / 200);
    const noiseAmount = scale(0, 18, (Number(v.noise ?? 30) / 100));
    const chromatic = scale(0, 9, (Number(v.chromatic ?? 20) / 100));

    const step = Math.max(6, Math.round(Math.min(w, h) / 95));

    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const nx = (x + step * .5 - cx) / rx;
        const ny = (y + step * .5 - cy) / ry;
        const dist = Math.sqrt(nx * nx + ny * ny);
        const inside = 1 - smoothstep(1 - softness, 1.08, dist);
        if (inside <= 0.005) {
          ctx.drawImage(this.sourceCanvas, x, y, step, step, x, y, step + 1, step + 1);
          continue;
        }

        const angle = Math.atan2(ny, nx);
        const phase = timeSec * waveSpeed;
        let wave = Math.sin(dist / waveSize + phase + Math.sin(angle * 3 + phase) * .65);

        if (v.type === 'heat') {
          wave = Math.sin(y * waveSize * 2.6 + phase * 2.2) * .78 + Math.sin(y * waveSize * 5.4 - phase) * .22;
        } else if (v.type === 'dream') {
          wave = Math.sin(dist / waveSize - phase) * .55 + Math.sin((nx - ny) * 6 + phase * .7) * .45;
        } else if (v.type === 'transition') {
          wave = Math.sign(Math.sin((x + y) * waveSize * 3 + phase * 3)) * .55 + Math.sin(angle * 8 + phase) * .45;
        }

        const rough = (noise2(x * .02 + phase, y * .02 - phase) - .5) * noiseAmount;
        const tangentX = -Math.sin(angle) * swirl * 18;
        const tangentY = Math.cos(angle) * swirl * 18;

        const dx = (Math.cos(angle) * (strength * wave + refraction) + tangentX + rough) * inside;
        const dy = (Math.sin(angle) * (strength * wave + refraction) + tangentY - rough) * inside;

        if (chromatic > .1 && inside > .2) {
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = .26 * inside;
          ctx.drawImage(this.sourceCanvas, x + dx - chromatic, y + dy, step, step, x, y, step + 1, step + 1);
          ctx.drawImage(this.sourceCanvas, x + dx + chromatic, y + dy, step, step, x, y, step + 1, step + 1);
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = 'source-over';
        }

        ctx.drawImage(this.sourceCanvas, x + dx, y + dy, step, step, x, y, step + 1, step + 1);
      }
    }
  }

  drawMaskAndGlow(timeSec) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const v = this.values;

    const cx = w * (Number(v.positionX ?? 50) / 100);
    const cy = h * (Number(v.positionY ?? 50) / 100);
    const radius = Math.min(w, h) * scale(.08, .62, (Number(v.radius ?? 60) / 100));
    const sx = Number(v.scaleX ?? 100) / 100;
    const sy = Number(v.scaleY ?? 100) / 100;
    const pulse = 1 + Math.sin(timeSec * scale(.4, 4, (Number(v.pulse ?? 45) / 100))) * .035 * (Number(v.loopIntensity ?? 50) / 100);
    const rimWidth = scale(2, 34, (Number(v.rimWidth ?? 50) / 100));
    const rimAlpha = scale(0, .86, (Number(v.rimAlpha ?? 50) / 100));
    const glow = scale(0, .8, (Number(v.glow ?? 50) / 100));

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(sx * pulse, sy * pulse);

    const grad = ctx.createRadialGradient(0, 0, radius * .35, 0, 0, radius * 1.42);
    grad.addColorStop(0, rgba(v.coreColor, glow * .14));
    grad.addColorStop(.62, rgba(v.rimColor, glow * .18));
    grad.addColorStop(1, rgba(v.rimColor, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.56, radius * 1.22, 0, 0, TAU);
    ctx.fill();

    if (v.showMask) {
      ctx.lineWidth = rimWidth;
      ctx.strokeStyle = rgba(v.rimColor, rimAlpha);
      ctx.shadowColor = v.rimColor;
      ctx.shadowBlur = 24 + glow * 52;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius, radius, 0, 0, TAU);
      ctx.stroke();

      ctx.lineWidth = Math.max(1, rimWidth * .22);
      ctx.strokeStyle = rgba(v.accentColor, .42 * rimAlpha);
      ctx.shadowColor = v.accentColor;
      ctx.shadowBlur = 18;
      for (let i = 0; i < 3; i += 1) {
        const offset = Math.sin(timeSec * 1.4 + i * 2.1) * radius * .04;
        ctx.beginPath();
        ctx.ellipse(offset, -offset * .5, radius * (1 + i * .065), radius * (1 - i * .04), i * .2 + timeSec * .08, 0, TAU);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawForegroundGrid(timeSec) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const v = this.values;
    const alpha = .08 + .06 * Math.sin(timeSec * .7);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = rgba(v.accentColor || '#ffc15f', 1);
    ctx.lineWidth = Math.max(1, w / 900);
    const spacing = Math.max(48, w / 11);
    for (let x = spacing * .5; x < w; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = spacing * .5; y < h; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  }
}
