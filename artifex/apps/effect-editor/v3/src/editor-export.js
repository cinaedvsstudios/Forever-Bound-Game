import { editorState, getDesignHeight, getDesignWidth } from './editor-state.js';
import { drawHeatDistortionLayer, drawParticle } from './fx-runtime.js';
import { toRuntimeLayer } from './physics-scale.js';
import { drawStructuredEffectLayer } from './portal-wormhole-runtime.js';
import { drawTextParticle, isTextLayer } from './text-runtime.js';
import { drawPrototypeLayer } from './prototype-adapters/prototype-renderers-source.js';

const DEFAULT_VIDEO_SECONDS = 5;
const DEFAULT_VIDEO_FPS = 30;
const VIDEO_TIME_OFFSET_MS = 1000;

let toast = () => {};
let exportCanvas = null;
let isRecording = false;

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
  const canvas = ensureExportCanvas();
  const fps = DEFAULT_VIDEO_FPS;
  const durationMs = DEFAULT_VIDEO_SECONDS * 1000;
  const mimeType = preferMp4 ? supportedMp4Type() : supportedWebmType();
  if (!mimeType) {
    toast(preferMp4 ? 'MP4 export is not supported in this browser. Use WebM.' : 'WebM export is not supported in this browser.', 'warn');
    return;
  }
  if (!canvas.captureStream || typeof MediaRecorder === 'undefined') {
    toast('Video recording is not supported in this browser.', 'warn');
    return;
  }

  renderCleanFrame(canvas, { transparent, timeMs: performance.now() + VIDEO_TIME_OFFSET_MS });
  const stream = canvas.captureStream(fps);
  const chunks = [];
  let recorder;
  try {
    recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 12000000 });
  } catch (error) {
    console.error(error);
    toast(preferMp4 ? 'MP4 export failed. Try WebM instead.' : 'WebM export failed in this browser.', 'warn');
    stopStream(stream);
    return;
  }

  isRecording = true;
  toast(`Recording ${preferMp4 ? 'MP4' : 'WebM'} export...`, 'info');

  recorder.ondataavailable = (event) => {
    if (event.data?.size) chunks.push(event.data);
  };
  recorder.onerror = (event) => {
    console.error(event.error || event);
    toast('Video export failed while recording.', 'warn');
  };
  recorder.onstop = () => {
    isRecording = false;
    stopStream(stream);
    const blob = new Blob(chunks, { type: mimeType });
    const extension = preferMp4 ? 'mp4' : 'webm';
    const suffix = transparent ? 'transparent' : 'black-bg';
    downloadBlob(blob, `${fileBaseName()}-${suffix}.${extension}`);
    toast(`${preferMp4 ? 'MP4' : 'WebM'} video exported.`, 'success');
  };

  const start = performance.now();
  recorder.start(250);

  const drawFrame = (now) => {
    const elapsed = now - start;
    renderCleanFrame(canvas, { transparent, timeMs: VIDEO_TIME_OFFSET_MS + elapsed });
    if (elapsed < durationMs && recorder.state === 'recording') {
      requestAnimationFrame(drawFrame);
      return;
    }
    window.setTimeout(() => {
      if (recorder.state === 'recording') recorder.stop();
    }, 120);
  };
  requestAnimationFrame(drawFrame);
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

function renderCleanFrame(canvas, { transparent, timeMs }) {
  const ctx = canvas.getContext('2d', { alpha: true });
  const width = getDesignWidth();
  const height = getDesignHeight();
  const t = Number.isFinite(Number(timeMs)) ? Number(timeMs) : performance.now();

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  if (!transparent) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    for (const layer of editorState.composition.layers) {
      if (layer.visible !== false) drawHeatDistortionLayer(ctx, toRuntimeLayer(layer), 1, t);
    }
  }

  for (const layer of editorState.composition.layers) {
    if (layer.visible !== false) drawStructuredEffectLayer(ctx, toRuntimeLayer(layer), 1, t);
  }
  for (const layer of editorState.composition.layers) {
    if (layer.visible !== false) drawPrototypeLayer(ctx, layer, 1, t, { width, height });
  }
  for (const item of editorState.particles) {
    const layer = editorState.composition.layers.find((candidate) => candidate.id === item.layerId);
    if (layer?.visible === false) continue;
    const runtimeLayer = toRuntimeLayer(layer);
    if (item.isTextParticle || isTextLayer(runtimeLayer)) drawTextParticle(ctx, item.particle, runtimeLayer, 1);
    else drawParticle(ctx, item.particle, runtimeLayer, 1);
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
