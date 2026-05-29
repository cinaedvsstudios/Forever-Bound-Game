import { editorState, getActiveLayer, onStateChange, updateActiveLayer } from './editor-state.js';
import { describeGravityScale, fromGravityControlValue, toGravityControlValue } from './physics-scale.js';

export function initEditorDynamicsControls() {
  bindTagsField();
  bindGravityControls();
  onStateChange(syncDynamicsControls);
  syncDynamicsControls();
}

function bindTagsField() {
  const input = document.getElementById('effect-tags-input');
  if (!input || input.dataset.dynamicsBound === 'true') return;
  input.dataset.dynamicsBound = 'true';
  input.addEventListener('input', () => {
    editorState.composition.tags = normalizeTags(input.value);
    editorState.composition.updatedAt = new Date().toISOString();
  });
}

function bindGravityControls() {
  const gravityInput = document.getElementById('gravity-input');
  const boostInput = document.getElementById('gravity-boost-input');
  if (gravityInput && gravityInput.dataset.dynamicsBound !== 'true') {
    gravityInput.dataset.dynamicsBound = 'true';
    gravityInput.addEventListener('input', applyGravityFromControls, true);
    gravityInput.addEventListener('change', applyGravityFromControls, true);
  }
  if (boostInput && boostInput.dataset.dynamicsBound !== 'true') {
    boostInput.dataset.dynamicsBound = 'true';
    boostInput.addEventListener('change', applyGravityFromControls);
  }
}

function applyGravityFromControls() {
  const gravityInput = document.getElementById('gravity-input');
  const boostInput = document.getElementById('gravity-boost-input');
  if (!gravityInput || !getActiveLayer()) return;
  updateActiveLayer({
    gravity: fromGravityControlValue(gravityInput.value),
    gravityBoost: Boolean(boostInput?.checked),
    gravityScaleVersion: 'ui'
  });
}

function syncDynamicsControls() {
  bindTagsField();
  bindGravityControls();
  const layer = getActiveLayer();
  const tagsInput = document.getElementById('effect-tags-input');
  if (tagsInput && document.activeElement !== tagsInput) {
    tagsInput.value = Array.isArray(editorState.composition.tags) ? editorState.composition.tags.join(', ') : '';
  }
  if (!layer) return;
  const gravityInput = document.getElementById('gravity-input');
  const boostInput = document.getElementById('gravity-boost-input');
  const output = document.getElementById('gravity-output');
  const note = document.querySelector('.index2-gravity-note');
  const controlValue = toGravityControlValue(layer.gravity, layer.gravityScaleVersion);
  if (gravityInput && document.activeElement !== gravityInput) gravityInput.value = String(controlValue);
  if (boostInput && document.activeElement !== boostInput) boostInput.checked = Boolean(layer.gravityBoost);
  const effective = controlValue * (layer.gravityBoost ? 2 : 1);
  if (output) output.textContent = String(effective);
  if (note) note.textContent = `0 = none · 100 = earth · Current: ${describeGravityScale(layer.gravity, layer.gravityBoost, layer.gravityScaleVersion || '')}`;
}

function normalizeTags(value) {
  return [...new Set(String(value || '').split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
}
