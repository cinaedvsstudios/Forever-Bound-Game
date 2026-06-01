import { editorState, getActiveLayer, onStateChange, updateActiveLayer } from './editor-state.js';
import { describeGravityScale, fromGravityControlValue, toGravityControlValue } from './physics-scale.js';

function finite(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = String(value);
}

export function initEditorDynamicsControls() {
  bindMetadataFields();
  bindGravityControls();
  onStateChange(syncDynamicsControls);
  syncDynamicsControls();
}

function bindMetadataFields() {
  const idInput = document.getElementById('archetype-id-input');
  const tagsInput = document.getElementById('effect-tags-input');
  if (idInput && idInput.dataset.dynamicsBound !== 'true') {
    idInput.dataset.dynamicsBound = 'true';
    idInput.addEventListener('input', () => {
      const nextId = String(idInput.value || '').trim();
      if (nextId) editorState.composition.id = nextId;
      editorState.composition.updatedAt = new Date().toISOString();
    });
  }
  if (tagsInput && tagsInput.dataset.dynamicsBound !== 'true') {
    tagsInput.dataset.dynamicsBound = 'true';
    tagsInput.addEventListener('input', () => {
      editorState.composition.tags = normalizeTags(tagsInput.value);
      editorState.composition.updatedAt = new Date().toISOString();
    });
  }
}

function bindGravityControls() {
  const gravityInput = document.getElementById('gravity-input');
  const orbitalInput = document.getElementById('orbital-force-input');
  const boostInput = document.getElementById('gravity-boost-input');
  if (gravityInput && gravityInput.dataset.dynamicsBound !== 'true') {
    gravityInput.dataset.dynamicsBound = 'true';
    gravityInput.addEventListener('input', applyGravityFromControls, true);
    gravityInput.addEventListener('change', applyGravityFromControls, true);
  }
  if (orbitalInput && orbitalInput.dataset.dynamicsBound !== 'true') {
    orbitalInput.dataset.dynamicsBound = 'true';
    orbitalInput.addEventListener('input', () => {
      updateActiveLayer({ orbitalForce: Number(orbitalInput.value) });
      setText('orbital-force-output', orbitalInput.value);
    });
    orbitalInput.addEventListener('change', () => updateActiveLayer({ orbitalForce: Number(orbitalInput.value) }));
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
  bindMetadataFields();
  bindGravityControls();
  const layer = getActiveLayer();
  const idInput = document.getElementById('archetype-id-input');
  const tagsInput = document.getElementById('effect-tags-input');
  if (idInput && document.activeElement !== idInput) idInput.value = String(editorState.composition.id || '');
  if (tagsInput && document.activeElement !== tagsInput) {
    tagsInput.value = Array.isArray(editorState.composition.tags) ? editorState.composition.tags.join(', ') : '';
  }
  if (!layer) return;
  const gravityInput = document.getElementById('gravity-input');
  const orbitalInput = document.getElementById('orbital-force-input');
  const boostInput = document.getElementById('gravity-boost-input');
  const output = document.getElementById('gravity-output');
  const note = document.querySelector('.index2-gravity-note');
  const controlValue = toGravityControlValue(layer.gravity, layer.gravityScaleVersion);
  if (gravityInput && document.activeElement !== gravityInput) gravityInput.value = String(controlValue);
  if (orbitalInput && document.activeElement !== orbitalInput) orbitalInput.value = String(finite(layer.orbitalForce, 0));
  setText('orbital-force-output', finite(layer.orbitalForce, 0));
  if (boostInput && document.activeElement !== boostInput) boostInput.checked = Boolean(layer.gravityBoost);
  const effective = controlValue * (layer.gravityBoost ? 2 : 1);
  if (output) output.textContent = String(effective);
  if (note) note.textContent = `0 = none · 100 = earth · Current: ${describeGravityScale(layer.gravity, layer.gravityBoost, layer.gravityScaleVersion || '')}`;
}

function normalizeTags(value) {
  return [...new Set(String(value || '').split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
}
