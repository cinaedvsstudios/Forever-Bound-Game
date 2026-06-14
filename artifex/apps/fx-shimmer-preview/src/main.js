import { SHIMMER_PRESETS, clonePreset } from './presets.js?v=1.28';
import { ShimmerDistortionEngine } from './shimmer-engine.js?v=1.28';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const canvas = $('[data-canvas]');
const engine = new ShimmerDistortionEngine(canvas);
const state = {
  selectedPresetId: SHIMMER_PRESETS[0].id,
  values: clonePreset(SHIMMER_PRESETS[0]).values,
  startedAt: performance.now(),
  pausedAt: 0,
  playing: true,
  textureName: '',
  textureDataUrl: '',
  overlayName: '',
  overlayDataUrl: '',
  overlay2Name: '',
  overlay2DataUrl: '',
  outlineName: '',
  outlineDataUrl: ''
};

const controls = $$('[data-field]');
const presetList = $('[data-preset-list]');
const jsonOutput = $('[data-json-output]');
const status = $('[data-status]');
const textureFile = $('[data-texture-file]');
const textureStatus = $('[data-texture-status]');
const overlayFile = $('[data-overlay-file]');
const overlayStatus = $('[data-overlay-status]');
const overlay2File = $('[data-overlay2-file]');
const overlay2Status = $('[data-overlay2-status]');
const outlineFile = $('[data-outline-file]');
const outlineStatus = $('[data-outline-status]');
const overlayLayerLabel = $('[data-overlay-layer-label]');
const overlay2LayerLabel = $('[data-overlay2-layer-label]');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function currentPreset() {
  return SHIMMER_PRESETS.find((preset) => preset.id === state.selectedPresetId) || SHIMMER_PRESETS[0];
}

function setStatus(message) {
  if (status) status.textContent = message;
}

function normalizeFieldValue(input) {
  if (input.type === 'checkbox') return input.checked;
  if (input.type === 'range') return Number(input.value);
  return input.value;
}

function updateTextureStatus() {
  if (!textureStatus) return;
  textureStatus.textContent = state.textureName ? `Loaded texture: ${state.textureName}` : 'No texture loaded.';
}

const OVERLAY_LAYER_LABELS = {
  'behind-effect': 'Behind effect',
  'inside-aperture': 'Inside aperture / core',
  'over-clouds': 'Over clouds / rim',
  front: 'Front overlay'
};
const OVERLAY_LAYER_ORDER = Object.keys(OVERLAY_LAYER_LABELS);

function updateOverlayStatus() {
  if (overlayStatus) overlayStatus.textContent = state.overlayName ? `Loaded overlay 1: ${state.overlayName}` : 'No overlay 1 loaded.';
  if (overlay2Status) overlay2Status.textContent = state.overlay2Name ? `Loaded overlay 2: ${state.overlay2Name}` : 'No overlay 2 loaded.';
  if (outlineStatus) outlineStatus.textContent = state.outlineName ? `Loaded line image: ${state.outlineName}` : 'No line image loaded.';
  if (overlayLayerLabel) overlayLayerLabel.textContent = OVERLAY_LAYER_LABELS[state.values.overlayLayer] || 'Over clouds / rim';
  if (overlay2LayerLabel) overlay2LayerLabel.textContent = OVERLAY_LAYER_LABELS[state.values.overlay2Layer] || 'Inside aperture / core';
}

function updateControlCardVisibility() {
  const type = state.values.type || 'ring';
  const visibleByType = {
    ring: new Set([
      'Shape',
      'Distortion',
      'Visual layer',
      'Portal inner wisps',
      'Portal line outline',
      'Colour / texture',
      'Orbit clouds',
      'Particles',
      'Aperture control',
      'PNG overlay 1',
      'PNG overlay 2',
      'Placement / playback'
    ]),
    wormhole: new Set([
      'Shape',
      'Distortion',
      'Visual layer',
      'Colour / texture',
      'Arms / nebula bands',
      'Orbit clouds',
      'Particles',
      'Emission',
      'Aperture control',
      'PNG overlay 1',
      'PNG overlay 2',
      'Placement / playback'
    ]),
    heat: new Set([
      'Shape',
      'Distortion',
      'Visual layer',
      'Colour / texture',
      'Placement / playback'
    ]),
    transition: new Set([
      'Shape',
      'Distortion',
      'Visual layer',
      'Colour / texture',
      'Particles',
      'Placement / playback'
    ])
  };

  const allowed = visibleByType[type] || visibleByType.ring;
  $$('.control-card').forEach((card) => {
    const title = $('h3', card)?.textContent?.trim();
    if (!title) return;
    card.hidden = !allowed.has(title);
  });
}

function syncControls() {
  controls.forEach((input) => {
    const key = input.dataset.field;
    const value = state.values[key];
    if (input.type === 'checkbox') input.checked = Boolean(value);
    else if (value !== undefined) input.value = value;
  });
  const preset = currentPreset();
  $('[data-effect-name]').textContent = preset.name;
  $('[data-effect-description]').textContent = preset.description;
  updateTextureStatus();
  updateOverlayStatus();
  updateControlCardVisibility();
  renderJson();
}

function renderPresets() {
  presetList.innerHTML = SHIMMER_PRESETS.map((preset) => `
    <button type="button" class="preset-card" data-preset="${preset.id}" aria-current="${preset.id === state.selectedPresetId ? 'true' : 'false'}">
      <strong>${preset.name}</strong>
      <small>${preset.description}</small>
    </button>
  `).join('');

  $$('[data-preset]').forEach((button) => {
    button.onclick = () => {
      const preset = SHIMMER_PRESETS.find((item) => item.id === button.dataset.preset);
      if (!preset) return;
      state.selectedPresetId = preset.id;
      state.values = clone(preset.values);
      state.startedAt = performance.now();
      state.pausedAt = 0;
      state.playing = true;
      renderPresets();
      syncControls();
      setStatus(`Loaded ${preset.name}.`);
    };
  });
}

function fxAssetJson() {
  const preset = currentPreset();
  return {
    schema: 'artifex.fxArchetype.v1',
    id: `fx_${preset.id.replaceAll('-', '_')}`,
    label: preset.name,
    type: 'refractionDistortionEffect',
    scope: 'project',
    projectId: 'forever-bound',
    engine: 'artifex-shimmer-distortion-preview',
    engineVersion: '1.2.8-preview',
    tags: preset.tags,
    assets: {
      ...(state.textureName ? { texture: { kind: 'externalImageReference', editorFileName: state.textureName } } : {}),
      ...(state.overlayName ? { overlay: { kind: 'externalPngOverlayReference', editorFileName: state.overlayName } } : {}),
      ...(state.overlay2Name ? { overlay2: { kind: 'externalPngOverlayReference', editorFileName: state.overlay2Name } } : {}),
      ...(state.outlineName ? { outlineColorImage: { kind: 'externalLineColorTextureReference', editorFileName: state.outlineName } } : {})
    },
    composition: {
      layers: [
        {
          id: 'layer_refraction_distortion',
          engine: 'shimmer-distortion',
          enabled: true,
          settings: clone(state.values)
        }
      ]
    },
    runtime: {
      loop: Boolean(state.values.loop),
      durationSec: Number(state.values.durationSec || 8),
      placement: {
        anchor: 'scene',
        xPercent: Number(state.values.positionX || 50),
        yPercent: Number(state.values.positionY || 50)
      }
    },
    compatibilityNotes: [
      'Prototype canvas renderer. Future integration should route this through the FX Editor engine registry.',
      'Portal Inner Wisps are intentionally separate from Portal Line Outline and wormhole Arms.',
      'V1.29 preserves the overlay/aperture pass and restores arm visibility with an arm layer-position control.',
      'Exports runtime-facing archetype shape, not final production schema.'
    ]
  };
}

function editorProjectJson() {
  const preset = currentPreset();
  return {
    schema: 'artifex.fxEditorProject.v1',
    editor: 'fx-shimmer-preview',
    editorVersion: '1.2.8-preview',
    selectedPresetId: state.selectedPresetId,
    name: preset.name,
    description: preset.description,
    values: clone(state.values),
    texture: state.textureName ? { name: state.textureName, dataUrl: state.textureDataUrl } : null,
    overlay: state.overlayName ? { name: state.overlayName, dataUrl: state.overlayDataUrl } : null,
    overlay2: state.overlay2Name ? { name: state.overlay2Name, dataUrl: state.overlay2DataUrl } : null,
    outlineColorImage: state.outlineName ? { name: state.outlineName, dataUrl: state.outlineDataUrl } : null,
    view: {
      showGrid: Boolean(state.values.showGrid),
      showMask: Boolean(state.values.showMask)
    }
  };
}

function renderJson() {
  if (jsonOutput) jsonOutput.textContent = JSON.stringify(fxAssetJson(), null, 2);
}

function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function loadImageFile(input, onReady) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => onReady(file, image, String(reader.result || ''));
    image.src = String(reader.result || '');
  };
  reader.readAsDataURL(file);
}

if (textureFile) {
  textureFile.addEventListener('change', () => {
    loadImageFile(textureFile, (file, image, dataUrl) => {
      engine.setTextureImage(image);
      state.textureName = file.name;
      state.textureDataUrl = dataUrl;
      state.values.sourceMode = 'texture';
      syncControls();
      setStatus(`Loaded texture ${file.name}.`);
    });
  });
}

if (overlayFile) {
  overlayFile.addEventListener('change', () => {
    loadImageFile(overlayFile, (file, image, dataUrl) => {
      engine.setOverlayImage(image);
      state.overlayName = file.name;
      state.overlayDataUrl = dataUrl;
      state.values.overlayEnabled = true;
      syncControls();
      setStatus(`Loaded overlay ${file.name}.`);
    });
  });
}

if (overlay2File) {
  overlay2File.addEventListener('change', () => {
    loadImageFile(overlay2File, (file, image, dataUrl) => {
      engine.setOverlay2Image(image);
      state.overlay2Name = file.name;
      state.overlay2DataUrl = dataUrl;
      state.values.overlay2Enabled = true;
      syncControls();
      setStatus(`Loaded overlay 2 ${file.name}.`);
    });
  });
}

if (outlineFile) {
  outlineFile.addEventListener('change', () => {
    loadImageFile(outlineFile, (file, image, dataUrl) => {
      engine.setOutlineImage(image);
      state.outlineName = file.name;
      state.outlineDataUrl = dataUrl;
      state.values.outlineColorMode = 'image';
      syncControls();
      setStatus(`Loaded portal line image ${file.name}.`);
    });
  });
}

function moveOverlayLayer(field, delta, label = 'Overlay') {
  const current = state.values[field] || (field === 'overlay2Layer' ? 'inside-aperture' : 'over-clouds');
  const index = OVERLAY_LAYER_ORDER.indexOf(current);
  const fallback = field === 'overlay2Layer' ? OVERLAY_LAYER_ORDER.indexOf('inside-aperture') : OVERLAY_LAYER_ORDER.indexOf('over-clouds');
  const safeIndex = index === -1 ? fallback : index;
  const next = Math.max(0, Math.min(OVERLAY_LAYER_ORDER.length - 1, safeIndex + delta));
  state.values[field] = OVERLAY_LAYER_ORDER[next];
  syncControls();
  setStatus(`${label} layer: ${OVERLAY_LAYER_LABELS[state.values[field]]}.`);
}

const overlayBack = $('[data-action="overlay-back"]');
const overlayForward = $('[data-action="overlay-forward"]');
const overlay2Back = $('[data-action="overlay2-back"]');
const overlay2Forward = $('[data-action="overlay2-forward"]');
if (overlayBack) overlayBack.onclick = () => moveOverlayLayer('overlayLayer', -1, 'Overlay 1');
if (overlayForward) overlayForward.onclick = () => moveOverlayLayer('overlayLayer', 1, 'Overlay 1');
if (overlay2Back) overlay2Back.onclick = () => moveOverlayLayer('overlay2Layer', -1, 'Overlay 2');
if (overlay2Forward) overlay2Forward.onclick = () => moveOverlayLayer('overlay2Layer', 1, 'Overlay 2');

controls.forEach((input) => {
  input.addEventListener('input', () => {
    state.values[input.dataset.field] = normalizeFieldValue(input);
    updateControlCardVisibility();
    renderJson();
  });
  input.addEventListener('change', () => {
    state.values[input.dataset.field] = normalizeFieldValue(input);
    updateControlCardVisibility();
    renderJson();
  });
});

$('[data-action="play"]').onclick = () => {
  if (!state.playing) {
    state.startedAt = performance.now() - state.pausedAt;
    state.playing = true;
  }
  setStatus('Playing shimmer preview.');
};

$('[data-action="pause"]').onclick = () => {
  state.playing = false;
  setStatus('Paused shimmer preview.');
};

$('[data-action="reset"]').onclick = () => {
  state.values = clone(currentPreset().values);
  state.startedAt = performance.now();
  state.pausedAt = 0;
  state.playing = true;
  syncControls();
  setStatus('Reset current preset.');
};

$('[data-action="export-project"]').onclick = () => {
  const preset = currentPreset();
  downloadJson(`fx-editor-project-${preset.id}.json`, editorProjectJson());
  setStatus('Exported editor project JSON.');
};

$('[data-action="export-asset"]').onclick = () => {
  const preset = currentPreset();
  downloadJson(`fx-asset-${preset.id}.json`, fxAssetJson());
  setStatus('Exported Artifex FX asset JSON.');
};

function tick(now) {
  if (state.playing) {
    state.pausedAt = now - state.startedAt;
  }

  const durationMs = Math.max(1000, Number(state.values.durationSec || 8) * 1000);
  let elapsed = state.pausedAt;
  if (state.values.loop) elapsed %= durationMs;
  else if (elapsed > durationMs) {
    elapsed = durationMs;
    state.playing = false;
    state.pausedAt = elapsed;
  }

  const seconds = elapsed / 1000;
  $('[data-time-readout]').textContent = `${seconds.toFixed(2)}s`;
  engine.setValues(state.values);
  engine.draw(seconds);
  requestAnimationFrame(tick);
}

renderPresets();
syncControls();
setStatus('Loaded shimmer engine prototype V1.29.');
requestAnimationFrame(tick);
