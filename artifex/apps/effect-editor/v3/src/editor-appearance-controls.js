import { getActiveLayer, onStateChange, updateActiveLayer } from './editor-state.js';

const SHAPE_CHOICES = [['circle', 'Circle / Soft Orb'], ['square', 'Square'], ['diamond', 'Diamond'], ['star', 'Star Spark'], ['slash', 'Slash Stroke']];
const BRUSH_CHOICES = [['spark', 'Spark'], ['soft-dot', 'Soft Dot'], ['smoke-puff', 'Smoke Puff'], ['slash', 'Slash Stroke'], ['flare', 'Flare Cross']];
const CONTROL_IDS = ['appearance-mode-select', 'render-choice-button', 'blend-mode-select', 'tint-mode-select', 'texture-fit-select', 'reverse-toggle', 'rotation-input', 'rotation-mode-select', 'rotation-jitter-input', 'edge-blur-input', 'texture-alpha-input', 'custom-texture-input', 'stop-color-input', 'stop-opacity-input', 'stop-size-input', 'stop-glow-input', 'add-stop-button', 'delete-stop-button'];
let toast = () => {};

export function initEditorAppearanceControls(showToast = () => {}) {
  toast = typeof showToast === 'function' ? showToast : () => {};
  bindControls();
  syncAppearanceControls();
  onStateChange(syncAppearanceControls);
}

function bindControls() {
  bindChange('appearance-mode-select', (value) => updateActiveLayer({ appearanceMode: value }));
  bindChange('blend-mode-select', (value) => updateActiveLayer({ blendMode: value }));
  bindChange('tint-mode-select', (value) => updateActiveLayer({ tintMode: value }));
  bindChange('texture-fit-select', (value) => updateActiveLayer({ textureFit: value }));
  const reverse = document.getElementById('reverse-toggle');
  reverse?.addEventListener('change', () => updateActiveLayer({ reverseColor: reverse.checked }));
  bindRange('rotation-input', 'rotation-output', 'rotation');
  bindChange('rotation-mode-select', (value) => updateActiveLayer({ rotationMode: normalizeRotationMode(value) }));
  bindRange('rotation-jitter-input', 'rotation-jitter-output', 'rotationJitter');
  bindRange('edge-blur-input', 'edge-blur-output', 'edgeBlur');
  bindRange('texture-alpha-input', 'texture-alpha-output', 'textureAlpha');
  document.getElementById('stop-color-input')?.addEventListener('input', (event) => updateActiveStop({ color: event.target.value }));
  document.getElementById('stop-opacity-input')?.addEventListener('input', (event) => updateActiveStop({ opacity: Number(event.target.value) }));
  document.getElementById('stop-size-input')?.addEventListener('input', (event) => updateActiveStop({ size: Number(event.target.value) }));
  document.getElementById('stop-glow-input')?.addEventListener('input', (event) => updateActiveStop({ glow: Number(event.target.value) }));
  document.getElementById('add-stop-button')?.addEventListener('click', addStop);
  document.getElementById('delete-stop-button')?.addEventListener('click', deleteStop);
  document.getElementById('render-choice-button')?.addEventListener('click', openRenderChoice);
  document.getElementById('custom-texture-input')?.addEventListener('change', loadCustomTexture);
}

function bindChange(id, handler) {
  const input = document.getElementById(id);
  input?.addEventListener('change', () => handler(input.value));
}
function bindRange(id, outputId, property) {
  const input = document.getElementById(id);
  input?.addEventListener('input', () => {
    document.getElementById(outputId).textContent = input.value;
    updateActiveLayer({ [property]: Number(input.value) });
  });
}

function openRenderChoice() {
  const layer = getActiveLayer();
  if (!layer) return;
  if ((layer.appearanceMode || 'shape') === 'custom') {
    document.getElementById('custom-texture-input')?.click();
    return;
  }
  const mode = layer.appearanceMode || 'shape';
  const choices = mode === 'brush' ? BRUSH_CHOICES : SHAPE_CHOICES;
  const property = mode === 'brush' ? 'builtInBrush' : 'particleShape';
  const dialog = document.getElementById('appearance-choice-dialog');
  const title = document.getElementById('appearance-choice-title');
  const list = document.getElementById('appearance-choice-list');
  if (!dialog || !title || !list) return;
  title.textContent = mode === 'brush' ? 'Choose Brush' : 'Choose Shape';
  list.replaceChildren(...choices.map(([value, label]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    if (layer[property] === value) button.classList.add('is-accent');
    button.addEventListener('click', () => {
      updateActiveLayer({ [property]: value, appearanceMode: mode });
      dialog.close();
    });
    return button;
  }));
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}

function loadCustomTexture(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    updateActiveLayer({ appearanceMode: 'custom', textureName: file.name, textureDataUrl: String(reader.result || '') });
    toast(`Custom texture loaded: ${file.name}`, 'success');
  });
  reader.readAsDataURL(file);
}

function addStop() {
  const layer = getActiveLayer();
  if (!layer) return;
  const stops = getStops(layer);
  if (stops.length >= 5) { toast('Maximum 5 appearance markers.', 'warn'); return; }
  const current = stops[clampIndex(layer.activeAppearanceStopIndex, stops)] || stops[0];
  const position = findOpenPosition(stops);
  const next = sanitizeStops([...stops, { id: newStopId(), position, color: current.color, opacity: current.opacity, size: current.size, glow: current.glow }]);
  updateActiveLayer({ appearanceStops: next, activeAppearanceStopIndex: next.findIndex((stop) => stop.position === position) });
  toast('Appearance marker added.', 'success');
}
function deleteStop() {
  const layer = getActiveLayer();
  if (!layer) return;
  const stops = getStops(layer);
  if (stops.length <= 1) { toast('Minimum 1 appearance marker.', 'warn'); return; }
  const index = clampIndex(layer.activeAppearanceStopIndex, stops);
  stops.splice(index, 1);
  const next = sanitizeStops(stops);
  updateActiveLayer({ appearanceStops: next, activeAppearanceStopIndex: Math.min(index, next.length - 1) });
  toast('Appearance marker deleted.', 'warn');
}
function updateActiveStop(patch) {
  const layer = getActiveLayer();
  if (!layer) return;
  const stops = getStops(layer);
  const index = clampIndex(layer.activeAppearanceStopIndex, stops);
  stops[index] = { ...stops[index], ...patch };
  updateActiveLayer({ appearanceStops: sanitizeStops(stops), activeAppearanceStopIndex: index });
}

function syncAppearanceControls() {
  const layer = getActiveLayer();
  CONTROL_IDS.forEach((id) => { const element = document.getElementById(id); if (element) element.disabled = !layer; });
  if (!layer) return;
  const stops = getStops(layer);
  renderStopTrack(layer, stops);
  syncStopEditor(layer, stops);
  setValue('appearance-mode-select', layer.appearanceMode || 'shape');
  setValue('blend-mode-select', layer.blendMode || defaultBlendMode(layer.engine));
  setValue('tint-mode-select', layer.tintMode || 'tint');
  setValue('texture-fit-select', layer.textureFit || 'contain');
  setValue('rotation-input', finite(layer.rotation, 0));
  setValue('rotation-mode-select', normalizeRotationMode(layer.rotationMode));
  setValue('rotation-jitter-input', finite(layer.rotationJitter, 5));
  setValue('edge-blur-input', finite(layer.edgeBlur, 0));
  setValue('texture-alpha-input', finite(layer.textureAlpha, 1));
  const reverse = document.getElementById('reverse-toggle');
  if (reverse) reverse.checked = Boolean(layer.reverseColor);
  setText('rotation-output', finite(layer.rotation, 0));
  setText('rotation-jitter-output', finite(layer.rotationJitter, 5));
  syncRotationControlVisibility(layer);
  setText('edge-blur-output', finite(layer.edgeBlur, 0));
  setText('texture-alpha-output', finite(layer.textureAlpha, 1));
  syncChoiceButton(layer);
}
function syncChoiceButton(layer) {
  const mode = layer.appearanceMode || 'shape';
  const title = document.getElementById('render-choice-title');
  const button = document.getElementById('render-choice-button');
  const status = document.getElementById('texture-status');
  if (!title || !button) return;
  button.classList.toggle('is-file', mode === 'custom');
  if (mode === 'brush') { title.textContent = 'Brush'; button.textContent = labelFor(BRUSH_CHOICES, layer.builtInBrush || 'spark'); }
  else if (mode === 'custom') { title.textContent = 'Image Brush'; button.textContent = layer.textureName || 'Choose Image Brush'; }
  else { title.textContent = 'Shape'; button.textContent = labelFor(SHAPE_CHOICES, layer.particleShape || 'circle'); }
  if (status) { status.hidden = mode !== 'custom'; status.textContent = layer.textureName ? `Loaded: ${layer.textureName}` : 'No custom texture loaded'; }
}

function renderStopTrack(layer, stops) {
  const preview = document.getElementById('appearance-ramp-preview');
  const track = document.getElementById('appearance-stop-track');
  if (!preview || !track) return;
  preview.style.background = rampGradient(stops);
  const selected = clampIndex(layer.activeAppearanceStopIndex, stops);
  track.replaceChildren(...stops.map((stop, index) => {
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = `appearance-stop-marker ${index === selected ? 'is-selected' : ''}`;
    marker.style.left = `${stop.position * 100}%`;
    marker.style.setProperty('--stop-color', stop.color);
    marker.title = `Stop ${index + 1} · ${Math.round(stop.position * 100)}%`;
    marker.addEventListener('click', () => updateActiveLayer({ activeAppearanceStopIndex: index }));
    marker.addEventListener('pointerdown', (event) => startMarkerDrag(event, stop.id));
    return marker;
  }));
}
function startMarkerDrag(event, stopId) {
  event.preventDefault();
  const track = document.getElementById('appearance-stop-track');
  if (!track) return;
  document.body.classList.add('is-dragging-appearance-stop');
  const move = (pointer) => {
    const layer = getActiveLayer();
    if (!layer) return;
    const stops = getStops(layer);
    if (!stops.some((stop) => stop.id === stopId)) return;
    const rect = track.getBoundingClientRect();
    const snapped = Math.round(clamp((pointer.clientX - rect.left) / Math.max(1, rect.width), 0, 1) * 10) / 10;
    const next = sanitizeStops(stops.map((stop) => stop.id === stopId ? { ...stop, position: snapped } : stop));
    updateActiveLayer({ appearanceStops: next, activeAppearanceStopIndex: Math.max(0, next.findIndex((stop) => stop.id === stopId)) });
  };
  const finish = () => {
    document.body.classList.remove('is-dragging-appearance-stop');
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', finish);
    window.removeEventListener('pointercancel', finish);
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', finish);
  window.addEventListener('pointercancel', finish);
  move(event);
}
function syncStopEditor(layer, stops) {
  const index = clampIndex(layer.activeAppearanceStopIndex, stops);
  const stop = stops[index];
  setValue('stop-color-input', stop.color); setValue('stop-opacity-input', stop.opacity); setValue('stop-size-input', stop.size); setValue('stop-glow-input', stop.glow);
  setText('stop-opacity-output', stop.opacity); setText('stop-size-output', stop.size); setText('stop-glow-output', stop.glow); setText('selected-stop-readout', `Stop ${index + 1} · ${Math.round(stop.position * 100)}%`);
  const add = document.getElementById('add-stop-button'); const remove = document.getElementById('delete-stop-button');
  if (add) add.disabled = stops.length >= 5;
  if (remove) remove.disabled = stops.length <= 1;
}
function getStops(layer) { return sanitizeStops(Array.isArray(layer.appearanceStops) && layer.appearanceStops.length ? layer.appearanceStops : [{ id: 'start', position: 0, color: layer.colorA || '#ffcc66', opacity: finite(layer.alphaStart, 1), size: finite(layer.sizeStart, 20), glow: finite(layer.glow, 12) }, { id: 'end', position: 1, color: layer.colorB || '#ff6600', opacity: finite(layer.alphaEnd, 0), size: finite(layer.sizeEnd, 4), glow: 0 }]); }
function sanitizeStops(stops) {
  const mapped = stops.slice(0, 5).map((stop, index) => ({ id: stop.id || `stop_${index}`, position: Math.round(clamp(Number(stop.position), 0, 1) * 10) / 10, color: normalizeHex(stop.color), opacity: clamp(Number(stop.opacity), 0, 1), size: clamp(Number(stop.size), 0, 180), glow: clamp(Number(stop.glow), 0, 80) })).sort((a, b) => a.position - b.position);
  if (mapped.length > 1) { mapped[0].position = 0; mapped[mapped.length - 1].position = 1; }
  return mapped.length ? mapped : [{ id: newStopId(), position: 0, color: '#ffcc66', opacity: 1, size: 20, glow: 12 }];
}
function rampGradient(stops) { return stops.length === 1 ? stops[0].color : `linear-gradient(to right, ${stops.map((stop) => `${stop.color} ${stop.position * 100}%`).join(', ')})`; }
function findOpenPosition(stops) { const used = new Set(stops.map((stop) => Math.round(stop.position * 10))); return ([5, 3, 7, 2, 4, 6, 8, 1, 9].find((slot) => !used.has(slot)) || 5) / 10; }
function newStopId() { return `stop_${Date.now().toString(36)}`; }
function labelFor(choices, value) { return choices.find(([choice]) => choice === value)?.[1] || choices[0][1]; }
function setValue(id, value) { const element = document.getElementById(id); if (element && document.activeElement !== element) element.value = String(value); }
function setText(id, value) { const element = document.getElementById(id); if (element) element.textContent = String(value); }
function normalizeHex(value) { const text = String(value || '').trim(); return /^#[0-9a-f]{6}$/i.test(text) ? text : '#ffcc66'; }
function defaultBlendMode(engine) { return ['gas', 'refraction', 'heatdistortion'].includes(engine) ? 'source-over' : 'lighter'; }
function normalizeRotationMode(value) { return ['random', 'range', 'fixed'].includes(value) ? value : 'random'; }
function syncRotationControlVisibility(layer) {
  const mode = normalizeRotationMode(layer.rotationMode);
  const rotationLabel = document.getElementById('rotation-input')?.closest('label');
  const jitterLabel = document.getElementById('rotation-jitter-label');
  if (rotationLabel) rotationLabel.toggleAttribute('hidden', mode === 'random');
  if (jitterLabel) jitterLabel.toggleAttribute('hidden', mode !== 'range');
}
function finite(value, fallback) { const number = Number(value); return Number.isFinite(number) ? number : fallback; }
function clamp(value, min, max) { const number = Number.isFinite(Number(value)) ? Number(value) : min; return Math.min(max, Math.max(min, number)); }
function clampIndex(value, stops) { return Math.min(Math.max(0, Math.round(Number(value) || 0)), Math.max(0, stops.length - 1)); }
