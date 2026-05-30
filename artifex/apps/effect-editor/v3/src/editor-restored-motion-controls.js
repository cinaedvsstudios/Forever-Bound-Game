import { getActiveLayer, onStateChange, updateActiveLayer } from './editor-state.js';

const CONTROL_IDS = ['rotation-mode-select', 'rotation-jitter-input', 'orbital-force-input'];

export function initEditorRestoredMotionControls(showToast = () => {}) {
  bindSelect('rotation-mode-select', 'rotationMode', (value) => {
    showToast(value === 'fixed' ? 'Particle rotation follows Rotate.' : 'Particle rotation uses random spin.', 'info');
  });
  bindRange('rotation-jitter-input', 'rotation-jitter-output', 'rotationJitter');
  bindRange('orbital-force-input', 'orbital-force-output', 'orbitalForce');
  onStateChange(syncRestoredMotionControls);
  syncRestoredMotionControls();
}

function bindSelect(id, property, afterChange = () => {}) {
  const input = document.getElementById(id);
  if (!input || input.dataset.restoredMotionBound === 'true') return;
  input.dataset.restoredMotionBound = 'true';
  input.addEventListener('change', () => {
    updateActiveLayer({ [property]: input.value });
    afterChange(input.value);
  });
}

function bindRange(id, outputId, property) {
  const input = document.getElementById(id);
  if (!input || input.dataset.restoredMotionBound === 'true') return;
  input.dataset.restoredMotionBound = 'true';
  input.addEventListener('input', () => {
    const value = Number(input.value);
    const output = document.getElementById(outputId);
    if (output) output.textContent = formatValue(value);
    updateActiveLayer({ [property]: value });
  });
}

function syncRestoredMotionControls() {
  const layer = getActiveLayer();
  CONTROL_IDS.forEach((id) => {
    const control = document.getElementById(id);
    if (control) control.disabled = !layer;
  });
  if (!layer) return;
  setValue('rotation-mode-select', layer.rotationMode || 'random');
  setValue('rotation-jitter-input', finite(layer.rotationJitter, 5));
  setText('rotation-jitter-output', finite(layer.rotationJitter, 5));
  setValue('orbital-force-input', finite(layer.orbitalForce, 0));
  setText('orbital-force-output', finite(layer.orbitalForce, 0));
  const jitter = document.getElementById('rotation-jitter-input');
  if (jitter) jitter.disabled = (layer.rotationMode || 'random') !== 'fixed';
}

function setValue(id, value) {
  const control = document.getElementById(id);
  if (control && document.activeElement !== control) control.value = String(value);
}
function setText(id, value) {
  const output = document.getElementById(id);
  if (output) output.textContent = formatValue(value);
}
function formatValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? (Number.isInteger(number) ? String(number) : String(Number(number.toFixed(3)))) : '0';
}
function finite(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
