import { editorState, getDesignHeight, getDesignWidth } from './editor-state.js';
import { drawHeatDistortionLayer, drawParticle, spawnParticlesForLayer, releaseParticleRuntimeState } from './fx-runtime.js';
import { toRuntimeLayer } from './physics-scale.js';
import { drawStructuredEffectLayer, isStructuredEffectLayer } from './portal-wormhole-runtime.js';
import { drawTextParticle, isTextLayer, spawnTextParticlesForLayer, releaseTextRuntimeState } from './text-runtime.js';
import { drawPrototypeLayer, isPrototypeRenderableLayer } from './prototype-adapters/prototype-renderers-source.js';

const DEFAULT_VIDEO_SECONDS = 5;
const DEFAULT_VIDEO_FPS = 30;
const MIN_VIDEO_SECONDS = 1;
const MAX_VIDEO_SECONDS = 60;
const VIDEO_TIME_OFFSET_MS = 1000;
const VIDEO_PARTICLE_CAP = 900;

let toast = () => {};
let exportCanvas = null;
let isRecording = false;
let videoExportSequence = 0;

export function initEditorExport(showToast) {
  toast = typeof showToast === 'function' ? showToast : () => {};
  ensureExportMenu();
  bindExportActions();
}

function ensureExportMenu() {
  if (document.getElementById('menu-export')) return;
  const fileMenu = document.querySelector('[data-menu="file"]')?.closest('.menu');
  const menu = document.createElement('div');
  menu.className = 'menu';
  menu.innerHTML = `
    <button class="menu-button" data-menu="export">Export ▾</button>
    <div class="menu-panel" id="menu-export">
      <button id="copy-png-clipboard-button" type="button">Copy PNG to Clipboard</button>
      <button id="download-png-button" type="button">Download PNG</button>
      <button id="download-webm-transparent-button" type="button">Download WebM Video (Transparent)</button>
      <button id="download-webm-black-button" type="button">Download WebM Video (Black BG)</button>
      <button id="download-mp4-black-button" type="button">Download MP4 Video (Black BG)</button>
    </div>
  `;
  if (fileMenu) fileMenu.insertAdjacentElement('afterend', menu);
  else document.querySelector('.menu-bar')?.prepend(menu);
}

function bindExportActions() {
  bindClick('copy-png-clipboard-button', copyPngToClipboard);
  bindClick('download-png-button', downloadTransparentPng);
  bindClick('download-webm-transparent-button', () => recordVideo({ transparent: true, preferMp4: false }));
  bindClick('download-webm-black-button', () => recordVideo({ transparent: false, preferMp4: false }));
  bindClick('download-mp4-black-button', () => recordVideo({ transparent: false, preferMp4: true }));
}

async function copyPngToClipboard() {
  try {
    const canvas = renderExportCanvas({ transparent: true, timeMs: performance.now() + VIDEO_TIME_OFFSET_MS });
    const blob = await canvasToBlob(canvas, 'image/png');
    if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
      downloadBlob(blob, `${fileBaseName()}-transparent.png`);
      toast('Clipboard image copy is not supported here. Downloaded PNG instead.', 'warn');
      return;
    }
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    toast('Transparent PNG copied to clipboard.', 'success');
  } catch (error) {
    console.error(error);
    toast('Could not copy PNG to clipboard.', 'warn');
  }
}

async function downloadTransparentPng() {
  try {
    const canvas = renderExportCanvas({ transparent: true, timeMs: performance.now() + VIDEO_TIME_OFFSET_MS });
    const blob = await canvasToBlob(canvas, 'image/png');
    downloadBlob(blob, `${fileBaseName()}-transparent.png`);
    toast('Transparent PNG exported.', 'success');
  } catch (error) {
    console.error(error);
    toast('Could not export PNG.', 'warn');
  }
}

async function recordVideo({ transparent, preferMp4 }) {
  if (isRecording) {
    toast('Video export is already running.', 'warn');
    return;
  }
  const seconds = askVideoDurationSeconds();
  if (!seconds) return;
  const fps = DEFAULT_VIDEO_FPS;
  const durationMs = seconds * 1000;
  const mimeType = preferMp4 ? supportedMp4Type() : supportedWebmType();
  if (!mimeType) {
    toast(preferMp4 ? 'MP4 export is not supported in this browser. Use WebM.' : 'WebM export is not supported in this browser.', 'warn');
    return;
  }
  if (typeof MediaRecorder === 'undefined') {
    toast('Video recording is not supported in this browser.', 'warn');
    return;
  }

  let stream;
  let recorder;
  let session;
  try {
    const canvas = ensureExportCanvas();
    if (typeof canvas.captureStream !== 'function') throw new Error('Canvas captureStream is unavailable.');
    session = createVideoSession();
    advanceVideoSession(session);
    renderCleanFrame(canvas, { transparent, timeMs: VIDEO_TIME_OFFSET_MS, session });
    stream = canvas.captureStream(fps);
    recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 12000000 });
  } catch (error) {
    console.error(error);
    if (stream) stopStream(stream);
    if (session) releaseVideoSession(session);
    toast(preferMp4 ? 'MP4 export could not start. Try WebM instead.' : 'WebM export could not start in this browser.', 'warn');
    return;
  }

  const canvas = exportCanvas;
  const chunks = [];
  let recordingError = null;
  let finished = false;
  let animationFrameId = 0;
  let stopTimerId = 0;

  const finish = () => {
    if (finished) return;
    finished = true;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (stopTimerId) window.clearTimeout(stopTimerId);
    stopStream(stream);
    releaseVideoSession(session);
    isRecording = false;

    if (recordingError || !chunks.length) {
      toast('Video export failed; no file was saved.', 'warn');
      return;
    }
    const blob = new Blob(chunks, { type: mimeType });
    if (!blob.size) {
      toast('Video export failed: the recording was empty.', 'warn');
      return;
    }
    try {
      const extension = preferMp4 ? 'mp4' : 'webm';
      const suffix = transparent ? 'transparent' : 'black-bg';
      downloadBlob(blob, `${fileBaseName()}-${suffix}-${seconds}s.${extension}`);
      toast(`${preferMp4 ? 'MP4' : 'WebM'} video exported.`, 'success');
    } catch (error) {
      console.error(error);
      toast('Video recording finished, but the file could not be saved.', 'warn');
    }
  };

  const fail = (error) => {
    recordingError = recordingError || error || new Error('Unknown video recording error.');
    console.error(recordingError);
    if (recorder.state === 'inactive') {
      finish();
    } else {
      try { recorder.stop(); } catch (stopError) { console.error(stopError); finish(); }
    }
  };

  recorder.ondataavailable = (event) => {
    if (event.data?.size) chunks.push(event.data);
  };
  recorder.onerror = (event) => fail(event.error || new Error('MediaRecorder reported an error.'));
  recorder.onstop = finish;

  isRecording = true;
  try {
    recorder.start(250);
  } catch (error) {
    fail(error);
    return;
  }
  toast(`Recording ${seconds}s ${preferMp4 ? 'MP4' : 'WebM'} export...`, 'info');

  const startedAt = performance.now();
  const maximumFrame = Math.ceil(seconds * fps);
  const drawFrame = (now) => {
    if (finished || recordingError || recorder.state !== 'recording') return;
    try {
      const elapsed = Math.min(durationMs, Math.max(0, now - startedAt));
      // Advance at a fixed 30 simulation frames/second, even when preview is paused.
      const targetFrame = Math.min(maximumFrame, Math.floor(elapsed * fps / 1000) + 1);
      while (session.frame < targetFrame) advanceVideoSession(session);
      renderCleanFrame(canvas, { transparent, timeMs: VIDEO_TIME_OFFSET_MS + elapsed, session });
      if (elapsed < durationMs) {
        animationFrameId = requestAnimationFrame(drawFrame);
      } else {
        stopTimerId = window.setTimeout(() => {
          if (recorder.state === 'recording') {
            try { recorder.stop(); } catch (error) { fail(error); }
          } else if (recorder.state === 'inactive') finish();
        }, 120);
      }
    } catch (error) {
      fail(error);
    }
  };
  animationFrameId = requestAnimationFrame(drawFrame);
}

function createVideoSession() {
  // Unique IDs isolate one-shot ring and text runtime state from live preview and other exports.
  const prefix = `video-export-${Date.now().toString(36)}-${++videoExportSequence}`;
  const layers = editorState.composition.layers.map((source, index) => {
    const layer = { ...structuredClone(source), id: `${prefix}-${index}` };
    return {
      layer,
      runtimeLayer: toRuntimeLayer(layer),
      text: isTextLayer(layer),
      procedural: isStructuredEffectLayer(layer) || isPrototypeRenderableLayer(layer)
    };
  });
  return {
    layers,
    layersById: new Map(layers.map((entry) => [entry.layer.id, entry])),
    particles: [],
    frame: 0
  };
}

function advanceVideoSession(session) {
  for (const entry of session.layers) {
    if (entry.layer.visible === false || entry.procedural || session.particles.length >= VIDEO_PARTICLE_CAP) continue;
    const spawned = entry.text
      ? spawnTextParticlesForLayer(entry.runtimeLayer)
      : spawnParticlesForLayer(entry.runtimeLayer);
    session.particles.push(...spawned.map((particle) => ({
      particle, layerId: entry.layer.id, isTextParticle: entry.text
    })));
  }
  for (const item of session.particles) {
    const entry = session.layersById.get(item.layerId);
    if (entry) item.particle.update(entry.runtimeLayer);
  }
  session.particles = session.particles.filter((item) => item.particle.alive);
  if (session.particles.length > VIDEO_PARTICLE_CAP) session.particles = session.particles.slice(-VIDEO_PARTICLE_CAP);
  session.frame += 1;
}

function releaseVideoSession(session) {
  for (const entry of session.layers) {
    releaseParticleRuntimeState(entry.layer.id);
    releaseTextRuntimeState(entry.layer.id);
  }
  session.particles.length = 0;
}

function askVideoDurationSeconds() {
  const answer = window.prompt(`Video length in seconds (${MIN_VIDEO_SECONDS}-${MAX_VIDEO_SECONDS})`, String(DEFAULT_VIDEO_SECONDS));
  if (answer === null) return null;
  const parsed = Number(String(answer).replace(',', '.').trim());
  if (!Number.isFinite(parsed)) {
    toast('Video export cancelled: enter a valid number of seconds.', 'warn');
    return null;
  }
  const seconds = Math.round(parsed * 10) / 10;
  if (seconds < MIN_VIDEO_SECONDS || seconds > MAX_VIDEO_SECONDS) {
    toast(`Video export cancelled: choose ${MIN_VIDEO_SECONDS}-${MAX_VIDEO_SECONDS} seconds.`, 'warn');
    return null;
  }
  return seconds;
}

function renderExportCanvas({ transparent, timeMs }) {
  const canvas = ensureExportCanvas();
  renderCleanFrame(canvas, { transparent, timeMs });
  return canvas;
}

function ensureExportCanvas() {
  if (!exportCanvas) exportCanvas = document.createElement('canvas');
  const width = getDesignWidth();
  const height = getDesignHeight();
  if (exportCanvas.width !== width) exportCanvas.width = width;
  if (exportCanvas.height !== height) exportCanvas.height = height;
  return exportCanvas;
}

function renderCleanFrame(canvas, { transparent, timeMs, session = null }) {
  const ctx = canvas.getContext('2d', { alpha: true });
  const width = canvas.width;
  const height = canvas.height;
  const t = Number.isFinite(Number(timeMs)) ? Number(timeMs) : performance.now();
  const layers = session?.layers || editorState.composition.layers.map((layer) => ({
    layer, runtimeLayer: toRuntimeLayer(layer)
  }));
  const layersById = session?.layersById || new Map(layers.map((entry) => [entry.layer.id, entry]));
  const particles = session?.particles || editorState.particles;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  if (!transparent) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    for (const entry of layers) {
      if (entry.layer.visible !== false) drawHeatDistortionLayer(ctx, entry.runtimeLayer, 1, t);
    }
  }

  for (const entry of layers) {
    if (entry.layer.visible !== false) drawStructuredEffectLayer(ctx, entry.runtimeLayer, 1, t);
  }
  for (const entry of layers) {
    if (entry.layer.visible !== false) drawPrototypeLayer(ctx, entry.layer, 1, t, { width, height });
  }
  for (const item of particles) {
    const entry = layersById.get(item.layerId);
    if (!entry || entry.layer.visible === false) continue;
    if (item.isTextParticle || isTextLayer(entry.runtimeLayer)) drawTextParticle(ctx, item.particle, entry.runtimeLayer, 1);
    else drawParticle(ctx, item.particle, entry.runtimeLayer, 1);
  }
  ctx.restore();
}

function supportedWebmType() {
  return firstSupportedType([
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm'
  ]);
}

function supportedMp4Type() {
  return firstSupportedType([
    'video/mp4;codecs=avc1.42E01E',
    'video/mp4;codecs=h264',
    'video/mp4'
  ]);
}

function firstSupportedType(types) {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return '';
  return types.find((type) => MediaRecorder.isTypeSupported(type)) || '';
}

function canvasToBlob(canvas, type) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error(`Could not create ${type} blob.`));
    }, type);
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function stopStream(stream) {
  for (const track of stream.getTracks()) track.stop();
}

function fileBaseName() {
  const raw = String(editorState.composition.id || 'artifex-effect').trim() || 'artifex-effect';
  return raw.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'artifex-effect';
}

function bindClick(id, action) {
  document.getElementById(id)?.addEventListener('click', action);
}
