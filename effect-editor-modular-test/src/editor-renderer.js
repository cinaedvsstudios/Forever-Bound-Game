import {
  editorState,
  getActiveLayer,
  getDesignHeight,
  getDesignWidth,
  moveActiveEmitter,
  onStateChange
} from './editor-state.js';
import {
  drawParticle,
  spawnParticlesForLayer
} from './fx-runtime.js';

let canvas;
let ctx;
let workspace;
let animationId;
let lastFrame = performance.now();
let lastDrawFrame = performance.now();
let fpsSmoothing = 60;
let drawFpsSmoothing = 60;
let referenceImage = null;
let referenceImageSource = '';
let lowPerfFrameSkip = false;
let lowPerfRedrawSkip = false;

export function initRenderer() {
  canvas = document.getElementById('fx-canvas');
  workspace = document.getElementById('workspace');
  if (!canvas || !workspace) {
    throw new Error('Renderer could not find #fx-canvas or #workspace.');
  }

  ctx = canvas.getContext('2d', { alpha: false });
  resizeCanvas();

  window.addEventListener('resize', resizeCanvas);
  canvas.addEventListener('pointerdown', handlePointer);
  canvas.addEventListener('pointermove', (event) => {
    if (event.buttons === 1) handlePointer(event);
  });

  onStateChange(() => {
    const active = getActiveLayer();
    if (active) syncCanvasCursor();
    syncReferenceImage();
  });

  animationId = requestAnimationFrame(tick);
}

export function resizeCanvas() {
  if (!canvas || !workspace) return;
  const rect = workspace.getBoundingClientRect();
  const deviceRatio = window.devicePixelRatio || 1;
  const ratio = editorState.lowPerformanceMode ? Math.min(1.25, deviceRatio) : deviceRatio;
  canvas.width = Math.max(320, Math.floor(rect.width * ratio));
  canvas.height = Math.max(180, Math.floor(rect.height * ratio));
  ctx = canvas.getContext('2d', { alpha: false });
}

export function clearRendererParticles() {
  editorState.particles = [];
}

export function takeSnapshot() {
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = `${editorState.composition.id || 'artifex-effect'}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function tick(now) {
  const delta = Math.max(1, now - lastFrame);
  lastFrame = now;
  const fps = 1000 / delta;
  fpsSmoothing = fpsSmoothing * 0.92 + fps * 0.08;
  editorState.renderStats.fps = Math.round(drawFpsSmoothing);
  editorState.renderStats.performanceMode = editorState.lowPerformanceMode ? 'Low · 50% redraw' : 'Full';
  editorState.renderStats.particleCap = editorState.lowPerformanceMode ? 260 : 900;

  if (!editorState.isPaused) {
    if (editorState.lowPerformanceMode) {
      lowPerfFrameSkip = !lowPerfFrameSkip;
      if (!lowPerfFrameSkip) updateParticles();
    } else {
      updateParticles();
    }
  }

  let shouldDraw = true;
  if (editorState.lowPerformanceMode) {
    lowPerfRedrawSkip = !lowPerfRedrawSkip;
    shouldDraw = !lowPerfRedrawSkip;
  } else {
    lowPerfRedrawSkip = false;
  }

  if (shouldDraw) {
    const drawDelta = Math.max(1, now - lastDrawFrame);
    lastDrawFrame = now;
    drawFpsSmoothing = drawFpsSmoothing * 0.9 + (1000 / drawDelta) * 0.1;
    draw();
  }

  animationId = requestAnimationFrame(tick);
}

function updateParticles() {
  const particleCap = editorState.lowPerformanceMode ? 260 : 900;
  for (const layer of editorState.composition.layers) {
    if (layer.visible !== false && editorState.particles.length < particleCap) {
      const spawned = spawnParticlesForLayer(layer, editorState.lowPerformanceMode ? 0.45 : 1);
      editorState.particles.push(...spawned.map((particle) => ({ particle, layerId: layer.id })));
    }
  }

  for (const item of editorState.particles) {
    const layer = editorState.composition.layers.find((candidate) => candidate.id === item.layerId);
    if (layer) item.particle.update(layer);
  }

  editorState.particles = editorState.particles.filter((item) => item.particle.alive);
  if (editorState.particles.length > particleCap) {
    editorState.particles = editorState.particles.slice(-particleCap);
  }
  editorState.renderStats.particles = editorState.particles.length;
}

function draw() {
  const scale = getScale();
  const offset = getOffset(scale);

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = editorState.workspaceMode === 'white' ? '#f7f3ee' : '#050405';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.translate(offset.x, offset.y);
  ctx.scale(editorState.zoom, editorState.zoom);

  drawStageBackground(scale);
  drawUnderlayMedia(scale);

  if (editorState.showGrid) drawGrid(scale);

  for (const item of editorState.particles) {
    const layer = editorState.composition.layers.find((candidate) => candidate.id === item.layerId);
    if (layer?.visible !== false) drawParticle(ctx, item.particle, layer, scale);
  }

  if (editorState.showHelpers) drawEmitterHelpers(scale);

  ctx.restore();
}

function drawStageBackground(scale) {
  const designWidth = getDesignWidth();
  const designHeight = getDesignHeight();
  ctx.fillStyle = editorState.workspaceMode === 'white' ? '#ffffff' : '#090708';
  ctx.fillRect(0, 0, designWidth * scale, designHeight * scale);

  const gradient = ctx.createRadialGradient(
    designWidth * scale * 0.5,
    designHeight * scale * 0.5,
    0,
    designWidth * scale * 0.5,
    designHeight * scale * 0.5,
    designWidth * scale * 0.55
  );
  if (editorState.workspaceMode === 'white') {
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#e9e3dc');
  } else {
    gradient.addColorStop(0, '#191115');
    gradient.addColorStop(1, '#050405');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, designWidth * scale, designHeight * scale);

  ctx.strokeStyle = editorState.workspaceMode === 'white' ? '#c0b7ac' : '#382a21';
  ctx.lineWidth = Math.max(1, scale);
  ctx.strokeRect(0, 0, designWidth * scale, designHeight * scale);
}

function drawUnderlayMedia(scale) {
  const reference = editorState.referenceMedia;
  if (!reference?.visible || !reference.dataUrl || !referenceImage) return;
  if (!referenceImage.complete) return;

  const stageW = getDesignWidth() * scale;
  const stageH = getDesignHeight() * scale;
  const imageRatio = referenceImage.naturalWidth / referenceImage.naturalHeight;
  const stageRatio = stageW / stageH;
  let drawW = stageW;
  let drawH = stageH;
  if (imageRatio > stageRatio) drawH = stageW / imageRatio;
  else drawW = stageH * imageRatio;
  const drawX = (stageW - drawW) / 2;
  const drawY = (stageH - drawH) / 2;

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, Number(reference.opacity) || 0.55));
  ctx.drawImage(referenceImage, drawX, drawY, drawW, drawH);
  ctx.restore();
}

function syncReferenceImage() {
  const reference = editorState.referenceMedia;
  if (!reference?.dataUrl || reference.dataUrl === referenceImageSource || reference.type === 'video') return;
  referenceImageSource = reference.dataUrl;
  referenceImage = new Image();
  referenceImage.src = reference.dataUrl;
}

function drawGrid(scale) {
  const designWidth = getDesignWidth();
  const designHeight = getDesignHeight();
  const stepX = designWidth / 16;
  const stepY = designHeight / 9;
  ctx.save();
  ctx.strokeStyle = editorState.workspaceMode === 'white' ? 'rgba(56,42,33,0.22)' : 'rgba(226,204,167,0.15)';
  ctx.fillStyle = editorState.workspaceMode === 'white' ? 'rgba(56,42,33,0.7)' : 'rgba(226,204,167,0.58)';
  ctx.lineWidth = 1;

  for (let c = 0; c <= 16; c++) {
    const x = c * stepX * scale;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, designHeight * scale);
    ctx.stroke();
    if (c < 16) ctx.fillText(String(c + 1), x + 6, 16);
  }

  for (let r = 0; r <= 9; r++) {
    const y = r * stepY * scale;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(designWidth * scale, y);
    ctx.stroke();
    if (r < 9) ctx.fillText(String.fromCharCode(65 + r), 6, y + 18);
  }
  ctx.restore();
}

function drawEmitterHelpers(scale) {
  const active = getActiveLayer();
  if (!active) return;

  const x = active.emitterX * scale;
  const y = active.emitterY * scale;

  ctx.save();
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--module-accent-strong').trim() || '#00a1d7';
  ctx.fillStyle = ctx.strokeStyle;
  ctx.lineWidth = Math.max(1, 2 * scale);
  ctx.beginPath();
  ctx.arc(x, y, 10 * scale, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x - 18 * scale, y);
  ctx.lineTo(x + 18 * scale, y);
  ctx.moveTo(x, y - 18 * scale);
  ctx.lineTo(x, y + 18 * scale);
  ctx.stroke();

  ctx.font = `${Math.max(10, 12 * scale)}px monospace`;
  ctx.fillText(`${Math.round(active.emitterX)}, ${Math.round(active.emitterY)}`, x + 14 * scale, y - 14 * scale);
  ctx.restore();
}

function handlePointer(event) {
  const active = getActiveLayer();
  if (!active) return;
  const rect = canvas.getBoundingClientRect();
  const ratioX = canvas.width / rect.width;
  const ratioY = canvas.height / rect.height;
  const scale = getScale();
  const offset = getOffset(scale);

  const canvasX = (event.clientX - rect.left) * ratioX;
  const canvasY = (event.clientY - rect.top) * ratioY;

  const worldX = ((canvasX - offset.x) / editorState.zoom) / scale;
  const worldY = ((canvasY - offset.y) / editorState.zoom) / scale;

  if (worldX >= 0 && worldX <= getDesignWidth() && worldY >= 0 && worldY <= getDesignHeight()) {
    moveActiveEmitter(worldX, worldY);
  }
}

function getScale() {
  return Math.min(canvas.width / getDesignWidth(), canvas.height / getDesignHeight());
}

function getOffset(scale) {
  return {
    x: (canvas.width - getDesignWidth() * scale * editorState.zoom) / 2,
    y: (canvas.height - getDesignHeight() * scale * editorState.zoom) / 2
  };
}

function syncCanvasCursor() {
  canvas.style.cursor = 'crosshair';
}
