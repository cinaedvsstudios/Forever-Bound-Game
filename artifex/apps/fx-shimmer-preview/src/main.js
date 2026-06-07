import { SHIMMER_PRESETS, clonePreset } from './presets.js?v=1.00';
import { ShimmerDistortionEngine } from './shimmer-engine.js?v=1.00';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const canvas = $('[data-canvas]');
const engine = new ShimmerDistortionEngine(canvas);
const state = {
  selectedPresetId: SHIMMER_PRESETS[0].id,
  values: clonePreset(SHIMMER_PRESETS[0]).values,
  startedAt: performance.now(),
  pausedAt: 0,
  playing: true
};

const controls = $$('[data-field]');
const presetList = $('[data-preset-list]');
const jsonOutput = $('[data-json-output]');
const status = $('[data-status]');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function currentPreset() {
  return SHIMMER_PRESETS.find((preset) => preset.id === state.selectedPresetId) || SHIMMER_PRESETS[0];
}

function setStatus(message) {
  status.textContent = message;
}

function normalizeFieldValue(input) {
  if (input.type === 'checkbox') return input.checked;
  if (input.type === 'range') return Number(input.value);
  return input.value;
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
    engineVersion: '1.0.0-preview',
    tags: preset.tags,
    assets: {},
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
      'Exports runtime-facing archetype shape, not final production schema.'
    ]
  };
}

function editorProjectJson() {
  const preset = currentPreset();
  return {
    schema: 'artifex.fxEditorProject.v1',
    editor: 'fx-shimmer-preview',
    editorVersion: '1.0.0-preview',
    selectedPresetId: state.selectedPresetId,
    name: preset.name,
    description: preset.description,
    values: clone(state.values),
    view: {
      showGrid: Boolean(state.values.showGrid),
      showMask: Boolean(state.values.showMask)
    }
  };
}

function renderJson() {
  jsonOutput.textContent = JSON.stringify(fxAssetJson(), null, 2);
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

controls.forEach((input) => {
  input.addEventListener('input', () => {
    state.values[input.dataset.field] = normalizeFieldValue(input);
    renderJson();
  });
  input.addEventListener('change', () => {
    state.values[input.dataset.field] = normalizeFieldValue(input);
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
setStatus('Loaded shimmer engine prototype.');
requestAnimationFrame(tick);
