import { getState, getSelectedLayer, mutate } from '../core/store.js';
import { constrainLayer } from '../core/scene-model.js';
import { dom, toast } from './dom.js';
import { applyChromaKey } from '../features/chroma-key.js';

export function setupPanels() {
  dom.layerList.addEventListener('click', onLayerListClick);
  document.querySelector('#layer-up-button').addEventListener('click', () => moveLayer(1));
  document.querySelector('#layer-down-button').addEventListener('click', () => moveLayer(-1));
  document.querySelector('#duplicate-layer-button').addEventListener('click', duplicateSelectedLayer);
  document.querySelector('#delete-layer-button').addEventListener('click', deleteSelectedLayer);
  document.querySelector('#reset-layer-button').addEventListener('click', resetSelectedLayer);
  document.querySelector('#apply-chroma-button').addEventListener('click', applyKeyToSelected);
  document.querySelector('#clear-chroma-button').addEventListener('click', clearKeyFromSelected);

  bindLayerControl(dom.blendMode, 'blendMode', (value) => value);
  bindLayerControl(dom.opacity, 'opacity', (value) => Number(value) / 100);
  bindLayerControl(dom.posX, 'x', Number);
  bindLayerControl(dom.posY, 'y', Number);
  bindLayerControl(dom.width, 'width', Number);
  bindLayerControl(dom.height, 'height', Number);
  bindFilterControl(dom.hue, 'hue');
  bindFilterControl(dom.saturation, 'saturation');
  bindFilterControl(dom.brightness, 'brightness');
  bindFilterControl(dom.contrast, 'contrast');
  bindChromaOutput(dom.chromaTolerance, dom.chromaToleranceOutput);
  bindChromaOutput(dom.chromaFeather, dom.chromaFeatherOutput);
}

function bindLayerControl(input, key, parse) {
  const apply = () => {
    const selected = getSelectedLayer();
    if (!selected) return;
    mutate(`Change ${key}`, (state) => {
      const layer = state.layers.find((item) => item.id === selected.id);
      layer[key] = parse(input.value);
      constrainLayer(layer, state.canvas);
    });
  };
  input.addEventListener('change', apply);
  input.addEventListener('input', () => {
    if (input.type === 'range') apply();
  });
}

function bindFilterControl(input, key) {
  const outputs = {
    hue: dom.hueOutput,
    saturation: dom.saturationOutput,
    brightness: dom.brightnessOutput,
    contrast: dom.contrastOutput
  };
  const suffix = key === 'hue' ? '°' : '%';
  input.addEventListener('input', () => {
    outputs[key].value = `${input.value}${suffix}`;
    const selected = getSelectedLayer();
    if (!selected) return;
    mutate(`Adjust ${key}`, (state) => {
      const layer = state.layers.find((item) => item.id === selected.id);
      layer.filters[key] = Number(input.value);
    });
  });
}

function bindChromaOutput(input, output) {
  input.addEventListener('input', () => { output.value = input.value; });
}

function onLayerListClick(event) {
  const row = event.target.closest('[data-layer-id]');
  if (!row) return;
  const id = row.dataset.layerId;
  const action = event.target.closest('[data-layer-action]')?.dataset.layerAction;
  if (action === 'visibility') {
    mutate('Toggle visibility', (state) => {
      const layer = state.layers.find((item) => item.id === id);
      layer.visible = !layer.visible;
    });
    return;
  }
  if (action === 'lock') {
    mutate('Toggle lock', (state) => {
      const layer = state.layers.find((item) => item.id === id);
      layer.locked = !layer.locked;
    });
    return;
  }
  mutate('Select layer', (state) => { state.selectedLayerId = id; }, { record: false });
}

export function renderPanels() {
  const state = getState();
  const selected = getSelectedLayer();
  dom.layerList.innerHTML = '';
  [...state.layers].reverse().forEach((layer) => {
    const row = dom.layerRowTemplate.content.firstElementChild.cloneNode(true);
    row.dataset.layerId = layer.id;
    row.classList.toggle('is-selected', layer.id === state.selectedLayerId);
    row.querySelector('img').src = layer.dataUrl;
    row.querySelector('strong').textContent = layer.name;
    row.querySelector('small').textContent = layer.isBackground ? 'Background' : layer.kind === 'glb' ? 'GLB render' : `${Math.round(layer.width)} × ${Math.round(layer.height)}`;
    const visibility = row.querySelector('.visibility-symbol');
    const lock = row.querySelector('.lock-symbol');
    visibility.dataset.layerAction = 'visibility';
    lock.dataset.layerAction = 'lock';
    visibility.textContent = layer.visible ? '👁️' : '🙈';
    lock.textContent = layer.locked ? '🔒' : '🔓';
    visibility.title = layer.visible ? 'Hide layer' : 'Show layer';
    lock.title = layer.locked ? 'Unlock layer' : 'Lock layer';
    visibility.classList.toggle('is-off', !layer.visible);
    lock.classList.toggle('is-off', !layer.locked);
    dom.layerList.append(row);
  });

  dom.selectedLayerName.textContent = selected?.name ?? 'Nothing selected';
  dom.emptyInspectorMessage.hidden = Boolean(selected);
  dom.layerControls.hidden = !selected;
  if (!selected) return;

  dom.blendMode.value = selected.blendMode;
  dom.opacity.value = String(Math.round(selected.opacity * 100));
  dom.opacityOutput.value = `${Math.round(selected.opacity * 100)}%`;
  dom.posX.value = String(Math.round(selected.x));
  dom.posY.value = String(Math.round(selected.y));
  dom.width.value = String(Math.round(selected.width));
  dom.height.value = String(Math.round(selected.height));
  dom.hue.value = String(selected.filters.hue);
  dom.hueOutput.value = `${selected.filters.hue}°`;
  dom.saturation.value = String(selected.filters.saturation);
  dom.saturationOutput.value = `${selected.filters.saturation}%`;
  dom.brightness.value = String(selected.filters.brightness);
  dom.brightnessOutput.value = `${selected.filters.brightness}%`;
  dom.contrast.value = String(selected.filters.contrast);
  dom.contrastOutput.value = `${selected.filters.contrast}%`;

  const chroma = selected.chroma ?? { colour: '#00ff00', tolerance: 36, feather: 0 };
  dom.chromaColour.value = chroma.colour;
  dom.chromaTolerance.value = String(chroma.tolerance);
  dom.chromaToleranceOutput.value = String(chroma.tolerance);
  dom.chromaFeather.value = String(chroma.feather ?? 0);
  dom.chromaFeatherOutput.value = String(chroma.feather ?? 0);
}

function moveLayer(offset) {
  const selected = getSelectedLayer();
  if (!selected) return;
  mutate(offset > 0 ? 'Move layer forward' : 'Move layer backward', (state) => {
    const index = state.layers.findIndex((item) => item.id === selected.id);
    const destination = Math.max(0, Math.min(state.layers.length - 1, index + offset));
    if (index === destination) return;
    const [layer] = state.layers.splice(index, 1);
    state.layers.splice(destination, 0, layer);
  });
}

function duplicateSelectedLayer() {
  const selected = getSelectedLayer();
  if (!selected) return;
  mutate('Duplicate layer', (state) => {
    const original = state.layers.find((item) => item.id === selected.id);
    const duplicate = structuredClone(original);
    duplicate.id = crypto.randomUUID?.() ?? `layer_${Date.now()}`;
    duplicate.name = `${original.name} copy`;
    duplicate.x += 28;
    duplicate.y += 28;
    const index = state.layers.findIndex((item) => item.id === original.id);
    state.layers.splice(index + 1, 0, duplicate);
    state.selectedLayerId = duplicate.id;
  });
}

function deleteSelectedLayer() {
  const selected = getSelectedLayer();
  if (!selected) return;
  mutate('Delete layer', (state) => {
    const index = state.layers.findIndex((item) => item.id === selected.id);
    state.layers.splice(index, 1);
    state.selectedLayerId = state.layers[Math.max(0, index - 1)]?.id ?? null;
  });
}

function resetSelectedLayer() {
  const selected = getSelectedLayer();
  if (!selected) return;
  mutate('Reset image', (state) => {
    const layer = state.layers.find((item) => item.id === selected.id);
    layer.dataUrl = layer.sourceDataUrl;
    layer.chroma = null;
  });
  toast('Image restored from its original imported asset.');
}

async function applyKeyToSelected() {
  const selected = getSelectedLayer();
  if (!selected) return;
  if (selected.kind === 'glb') {
    toast('Chroma key is only available on image layers.', { error: true });
    return;
  }
  try {
    const keyedDataUrl = await applyChromaKey(
      { ...selected, sourceDataUrl: selected.dataUrl },
      dom.chromaColour.value,
      dom.chromaTolerance.value,
      dom.chromaFeather.value
    );
    mutate('Apply chroma key', (state) => {
      const layer = state.layers.find((item) => item.id === selected.id);
      layer.dataUrl = keyedDataUrl;
      layer.chroma = {
        colour: dom.chromaColour.value,
        tolerance: Number(dom.chromaTolerance.value),
        feather: Number(dom.chromaFeather.value)
      };
    });
    toast('Chroma key applied to selected image.');
  } catch (error) {
    console.error(error);
    toast('Could not apply chroma key.', { error: true });
  }
}

function clearKeyFromSelected() {
  const selected = getSelectedLayer();
  if (!selected) return;
  mutate('Clear chroma key', (state) => {
    const layer = state.layers.find((item) => item.id === selected.id);
    layer.dataUrl = layer.sourceDataUrl;
    layer.chroma = null;
  });
}
