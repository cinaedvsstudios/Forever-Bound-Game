import {
  editorState,
  getActiveLayer,
  getDesignHeight,
  getDesignWidth,
  moveActiveEmitter,
  onStateChange
} from './editor-state.js';
import {
  drawHeatDistortionLayer,
  drawParticle,
  spawnParticlesForLayer
} from './fx-runtime.js';
import { toRuntimeLayer } from './physics-scale.js';
import { drawTextParticle, isTextLayer, spawnTextParticlesForLayer } from './text-runtime.js';
import { drawStructuredEffectLayer, isStructuredEffectLayer } from './portal-wormhole-runtime.js';

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
let renderTime = 0;
let targetPickCallback = null;
let isWorkspacePanning = false;
let lastPanPoint = null;

export function initRenderer() {
  canvas = document.getElementById('fx-canvas');
  workspace = document.getElementById('workspace');
  if (!canvas || !workspace) {
    throw new Error('Renderer could not find #fx-canvas or #workspace.');
  }

  ctx = canvas.getContext('2d', { alpha: false });
  resizeCanvas();

  window.addEventListener('resize', resizeCanvas);
  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', (event) => {
    if (isWorkspacePanning) return;
    if (event.buttons === 1 && !targetPickCallback) handlePointer(event);
  });
  canvas.addEventListener('auxclick', (event) => {
    if (event.button === 1) event.preventDefault();
  });
  canvas.addEventListener('contextmenu', (event) => {
    if (isWorkspacePanning) event.preventDefault();
  });

  onStateChange(() => {
    const active = getActiveLayer();
    if (active) syncCanvasCursor();
    syncReferenceImage();
  });

  animationId = requestAnimationFrame(tick);
}

export function beginTargetPick(callback) {
  targetPickCallback = typeof callback === 'function' ? callback : null;
  syncCanvasCursor();
}

export function resizeCanvas() {
  if (!canvas || !workspace) return;
  const rect = workspace.getBoundingClientRect();
  const deviceRatio = window.devicePixelRatio || 1;
  const ratio = editorState.emergencyLiteMode ? 0.75 : (editorState.lowPerformanceMode ? Math.min(1.25, deviceRatio) : deviceRatio);
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
  renderTime = now;

  if (editorState.emergencyLiteMode && editorState.isPaused) {
    editorState.renderStats.fps = 0;
    editorState.renderStats.performanceMode = 'Emergency Idle';
    editorState.renderStats.particleCap = 80;
    editorState.renderStats.particles = editorState.particles.length;
    if (now - lastDrawFrame > 450) {
      lastDrawFrame = now;
      draw();
    }
    window.setTimeout(() => {
      animationId = requestAnimationFrame(tick);
    }, 250);
    return;
  }

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
  const particleCap = editorState.emergencyLiteMode ? 80 : (editorState.lowPerformanceMode ? 260 : 900);
  for (const layer of editorState.composition.layers) {
    if (layer.visible !== false && !isStructuredEffectLayer(layer) && editorState.particles.length < particleCap) {
      const runtimeLayer = toRuntimeLayer(layer);
      const densityScale = editorState.emergencyLiteMode ? 0.18 : (editorState.lowPerformanceMode ? 0.45 : 1);
      const spawned = isTextLayer(runtimeLayer)
        ? spawnTextParticlesForLayer(runtimeLayer, densityScale)
        : spawnParticlesForLayer(runtimeLayer, densityScale);
      editorState.particles.push(...spawned.map((particle) => ({ particle, layerId: layer.id, isTextParticle: isTextLayer(runtimeLayer) })));
    }
  }

  for (const item of editorState.particles) {
    const layer = editorState.composition.layers.find((candidate) => candidate.id === item.layerId);
    if (layer) item.particle.update(toRuntimeLayer(layer));
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

  for (const layer of editorState.composition.layers) {
    drawHeatDistortionLayer(ctx, toRuntimeLayer(layer), scale, renderTime);
  }

  if (editorState.showGrid) drawGrid(scale);

  for (const layer of editorState.composition.layers) {
    drawStructuredEffectLayer(ctx, toRuntimeLayer(layer), scale, renderTime);
  }

  for (const item of editorState.particles) {
    const layer = editorState.composition.layers.find((candidate) => candidate.id === item.layerId);
    if (layer?.visible !== false) {
      const runtimeLayer = toRuntimeLayer(layer);
      if (item.isTextParticle || isTextLayer(runtimeLayer)) drawTextParticle(ctx, item.particle, runtimeLayer, scale);
      else drawParticle(ctx, item.particle, runtimeLayer, scale);
    }
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
  const underlayScale = Math.max(0.25, Math.min(2, Number(reference.scale) || 1));
  drawW *= underlayScale;
  drawH *= underlayScale;
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
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--module-accent-strong').trim() || '#00a1d7';
  const angle = Number.isFinite(Number(active.angle)) ? Number(active.angle) : -90;
  const radians = angle * Math.PI / 180;
  const directionLength = 58 * scale;
  const endX = x + Math.cos(radians) * directionLength;
  const endY = y + Math.sin(radians) * directionLength;
  const wing = 10 * scale;
  const width = Math.max(0, Number(active.emitterWidth) || 0) * scale;

  ctx.save();
  ctx.strokeStyle = accent;
  ctx.fillStyle = accent;
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

  ctx.save();
  ctx.setLineDash([4 * scale, 4 * scale]);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - Math.cos(radians - Math.PI / 4) * wing, endY - Math.sin(radians - Math.PI / 4) * wing);
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - Math.cos(radians + Math.PI / 4) * wing, endY - Math.sin(radians + Math.PI / 4) * wing);
  ctx.stroke();

  if (width > 20 * scale) {
    const left = x - width / 2;
    const right = x + width / 2;
    const brace = 13 * scale;
    ctx.beginPath();
    ctx.moveTo(left + brace, y - brace);
    ctx.lineTo(left, y - brace);
    ctx.lineTo(left, y + brace);
    ctx.lineTo(left + brace, y + brace);
    ctx.moveTo(right - brace, y - brace);
    ctx.lineTo(right, y - brace);
    ctx.lineTo(right, y + brace);
    ctx.lineTo(right - brace, y + brace);
    ctx.stroke();
  }
  ctx.restore();
}

function handlePointerDown(event) {
  if (event.button === 1 || event.buttons === 4) {
    beginWorkspacePan(event);
    return;
  }
  handlePointer(event);
}

function beginWorkspacePan(event) {
  if (!canvas) return;
  event.preventDefault();
  event.stopPropagation();
  isWorkspacePanning = true;
  lastPanPoint = { x: event.clientX, y: event.clientY };
  canvas.setPointerCapture(event.pointerId);
  canvas.addEventListener('pointermove', handleWorkspacePan);
  canvas.addEventListener('pointerup', endWorkspacePan, { once: true });
  canvas.addEventListener('pointercancel', endWorkspacePan, { once: true });
}

function handleWorkspacePan(event) {
  if (!isWorkspacePanning || !lastPanPoint) return;
  const dx = event.clientX - lastPanPoint.x;
  const dy = event.clientY - lastPanPoint.y;
  lastPanPoint = { x: event.clientX, y: event.clientY };
  const currentOffset = editorState.viewOffset || { x: 0, y: 0 };
  editorState.viewOffset = { x: currentOffset.x + dx, y: currentOffset.y + dy };
}

function endWorkspacePan(event) {
  if (event?.pointerId && canvas?.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  isWorkspacePanning = false;
  lastPanPoint = null;
  canvas?.removeEventListener('pointermove', handleWorkspacePan);
}

function handlePointer(event) {
  const point = canvasToStage(event);
  if (targetPickCallback) {
    const callback = targetPickCallback;
    targetPickCallback = null;
    syncCanvasCursor();
    callback(point.x, point.y);
    return;
  }
  moveActiveEmitter(point.x, point.y);
}

function canvasToStage(event) {
  const rect = canvas.getBoundingClientRect();
  const scale = getScale();
  const offset = getOffset(scale);
  const cssX = event.clientX - rect.left;
  const cssY = event.clientY - rect.top;
  const pixelRatio = canvas.width / Math.max(1, rect.width);
  return {
    x: Math.max(0, Math.min(getDesignWidth(), ((cssX * pixelRatio - offset.x) / editorState.zoom) / scale)),
    y: Math.max(0, Math.min(getDesignHeight(), ((cssY * pixelRatio - offset.y) / editorState.zoom) / scale))
  };
}

function getScale() {
  return Math.min(canvas.width / getDesignWidth(), canvas.height / getDesignHeight()) * 0.82;
}

function getOffset(scale) {
  const stageW = getDesignWidth() * scale * editorState.zoom;
  const stageH = getDesignHeight() * scale * editorState.zoom;
  const pan = editorState.viewOffset || { x: 0, y: 0 };
  return {
    x: (canvas.width - stageW) / 2 + pan.x,
    y: (canvas.height - stageH) / 2 + pan.y
  };
}

function syncCanvasCursor() {
  if (!canvas) return;
  canvas.style.cursor = targetPickCallback ? 'crosshair' : 'default';
}
