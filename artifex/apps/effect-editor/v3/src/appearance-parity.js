import { getActiveLayer, onStateChange, updateActiveLayer } from './editor-state.js';

const SHAPE_CHOICES = [
  ['circle', 'Circle / Soft Orb'],
  ['square', 'Square'],
  ['diamond', 'Diamond'],
  ['star', 'Star Spark'],
  ['slash', 'Slash Stroke']
];

const BRUSH_CHOICES = [
  ['spark', 'Spark'],
  ['soft-dot', 'Soft Dot'],
  ['smoke-puff', 'Smoke Puff'],
  ['slash', 'Slash Stroke'],
  ['flare', 'Flare Cross']
];

const controlIds = [
  'appearance-mode-select',
  'render-choice-button',
  'blend-mode-select',
  'tint-mode-select',
  'texture-fit-select',
  'reverse-toggle',
  'rotation-input',
  'edge-blur-input',
  'texture-alpha-input',
  'custom-texture-input',
  'stop-color-input',
  'stop-opacity-input',
  'stop-size-input',
  'stop-glow-input',
  'add-stop-button',
  'delete-stop-button'
];

export function initAppearanceParity(showToast = () => {}) {
  injectAppearanceStyles();
  ensureAppearanceControls();
  bindAppearanceControls(showToast);
  syncAppearanceControls();
  onStateChange(syncAppearanceControls);
}

function injectAppearanceStyles() {
  if (document.getElementById('appearance-parity-style')) return;
  const style = document.createElement('style');
  style.id = 'appearance-parity-style';
  style.textContent = `
    .legacy-appearance-field { display: none !important; }
    .appearance-ramp-editor { display: grid; gap: 12px; }
    .appearance-ramp-preview { position: relative; height: 52px; border: 1px solid var(--module-accent); border-radius: 0; background: #111; box-shadow: inset 0 0 20px rgba(0,0,0,.65), 0 0 10px var(--module-glow); }
    .appearance-ramp-grid { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(to right, rgba(255,255,255,.10) 1px, transparent 1px); background-size: 10% 100%; opacity: .45; }
    .appearance-stop-track { position: relative; height: 44px; margin: 4px 9px 0; }
    .appearance-stop-marker { position: absolute; top: 5px; transform: translateX(-50%); display: grid; place-items: center; width: 24px; height: 32px; border: 0; background: transparent; box-shadow: none; padding: 0; color: var(--module-accent-strong); cursor: grab; touch-action: none; }
    .appearance-stop-marker::before { content: ''; width: 17px; height: 17px; border-radius: 6px 6px 9px 9px; border: 2px solid var(--text); background: var(--stop-color, #fff); box-shadow: 0 0 0 2px #111, 0 0 12px var(--module-glow); transform: rotate(45deg); }
    .appearance-stop-marker.is-selected::before { border-color: var(--module-accent-strong); box-shadow: 0 0 0 2px #111, 0 0 16px var(--module-glow); }
    .appearance-stop-marker:active { cursor: grabbing; }
    body.is-dragging-appearance-stop { cursor: grabbing; user-select: none; }
    .appearance-stop-labels { display: grid; grid-template-columns: repeat(11, 1fr); margin-top: 4px; font-family: 'Fira Code', monospace; font-size: 9px; color: var(--module-accent-strong); text-align: center; }
    .appearance-stop-buttons { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 8px; }
    .appearance-stop-buttons span { color: var(--muted); font-size: 11px; }
    .appearance-stop-buttons button { min-height: 34px; padding: 6px 10px; }
    .appearance-stop-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; border-top: 1px solid rgba(56,42,33,.72); padding-top: 12px; }
    .appearance-stop-fields label { margin: 0; }
    .appearance-stop-fields .appearance-wide { grid-column: 1 / -1; }
    .appearance-stop-fields input[type='color'] { min-height: 44px; }
    .appearance-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .appearance-grid label { margin: 0; }
    .render-choice-button { width: 100%; min-height: 40px; text-align: left; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .render-choice-button::after { content: '▾'; color: var(--gold-muted); }
    .render-choice-button.is-file::after { content: '↥'; color: var(--module-accent-strong); }
    .render-choice-status { margin-top: 6px; color: var(--muted); font-size: 11px; text-transform: none; letter-spacing: .02em; font-weight: 500; }
    .render-choice-status[hidden] { display: none; }
    .inline-toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 11px 0; color: var(--gold-muted); font-size: 10px; text-transform: uppercase; letter-spacing: .12em; font-weight: 800; }
    .inline-toggle-row input { width: auto; accent-color: var(--purple2); }
    .appearance-choice-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(145px, 1fr)); gap: 10px; padding-top: 12px; }
    .appearance-choice-grid button { min-height: 44px; text-align: center; }
  `;
  document.head.append(style);
}

function ensureAppearanceControls() {
  const cards = Array.from(document.querySelectorAll('#left-panel .card'));
  const appearanceCard = cards.find((card) => card.querySelector('h2')?.textContent?.trim() === 'Effect Layer Appearance');
  if (!appearanceCard || document.getElementById('appearance-ramp-editor')) return;

  markLegacyAppearanceControls();

  const header = appearanceCard.querySelector('header');
  header.insertAdjacentHTML('afterend', `
    <div id="appearance-ramp-editor" class="appearance-ramp-editor">
      <div id="appearance-ramp-preview" class="appearance-ramp-preview">
        <div class="appearance-ramp-grid"></div>
        <div id="appearance-stop-track" class="appearance-stop-track"></div>
      </div>
      <div class="appearance-stop-labels" aria-hidden="true">
        <span>0</span><span>10</span><span>20</span><span>30</span><span>40</span><span>50</span><span>60</span><span>70</span><span>80</span><span>90</span><span>100</span>
      </div>
      <div class="appearance-stop-buttons">
        <span id="selected-stop-readout">Stop 1 · 0%</span>
        <button id="add-stop-button" type="button" title="Add appearance marker">+</button>
        <button id="delete-stop-button" type="button" title="Delete selected appearance marker">🗑</button>
      </div>
      <div class="appearance-stop-fields">
        <label class="appearance-wide">Colour
          <input id="stop-color-input" type="color" value="#ffcc66" />
        </label>
        <label>Opacity
          <input id="stop-opacity-input" type="range" min="0" max="1" step="0.01" value="1" />
          <output id="stop-opacity-output">1</output>
        </label>
        <label>Size
          <input id="stop-size-input" type="range" min="0" max="180" step="1" value="20" />
          <output id="stop-size-output">20</output>
        </label>
        <label>Glow
          <input id="stop-glow-input" type="range" min="0" max="80" step="1" value="12" />
          <output id="stop-glow-output">12</output>
        </label>
      </div>
    </div>
  `);

  appearanceCard.insertAdjacentHTML('beforeend', `
    <div class="appearance-grid">
      <label>Particle Render Mode
        <select id="appearance-mode-select">
          <option value="shape">Shape</option>
          <option value="brush">Built-in Brush</option>
          <option value="custom">Custom Image Brush</option>
        </select>
      </label>
      <label id="render-choice-label"><span id="render-choice-title">Shape</span>
        <button id="render-choice-button" class="render-choice-button" type="button">Circle / Soft Orb</button>
        <input id="custom-texture-input" type="file" accept="image/png,image/webp,image/jpeg" hidden />
        <span id="texture-status" class="render-choice-status" hidden>No custom texture loaded</span>
      </label>
      <label>Blend Mode
        <select id="blend-mode-select">
          <option value="lighter">Additive Glow</option>
          <option value="source-over">Normal Alpha</option>
          <option value="screen">Screen Lighten</option>
          <option value="multiply">Multiply Darken</option>
        </select>
      </label>
      <label>Tint Mode
        <select id="tint-mode-select">
          <option value="tint">Tint visible pixels</option>
          <option value="original">Keep original colours</option>
          <option value="alpha-mask">Use as alpha mask</option>
        </select>
      </label>
      <label>Texture Fit
        <select id="texture-fit-select">
          <option value="contain">Fit inside particle</option>
          <option value="cover">Fill particle area</option>
          <option value="stretch">Stretch to square</option>
        </select>
      </label>
      <label>Rotate
        <input id="rotation-input" type="range" min="-180" max="180" step="1" value="0" />
        <output id="rotation-output">0</output>
      </label>
      <label>Soft Edge
        <input id="edge-blur-input" type="range" min="0" max="5" step="0.1" value="0" />
        <output id="edge-blur-output">0</output>
      </label>
      <label>Texture Opacity
        <input id="texture-alpha-input" type="range" min="0" max="1" step="0.01" value="1" />
        <output id="texture-alpha-output">1</output>
      </label>
    </div>
    <label class="inline-toggle-row">Reverse Colour Gradient
      <input id="reverse-toggle" type="checkbox" />
    </label>
  `);

  if (!document.getElementById('appearance-choice-dialog')) {
    document.body.insertAdjacentHTML('beforeend', `
      <dialog id="appearance-choice-dialog">
        <form method="dialog">
          <header class="dialog-header">
            <h2 id="appearance-choice-title">Choose Shape</h2>
            <button value="close" title="Close chooser">×</button>
          </header>
          <div id="appearance-choice-list" class="appearance-choice-grid"></div>
        </form>
      </dialog>
    `);
  }
}

function markLegacyAppearanceControls() {
  for (const id of ['color-a-input', 'color-b-input', 'alpha-start-input', 'alpha-end-input', 'size-start-input', 'size-end-input', 'glow-input']) {
    const control = document.getElementById(id);
    const label = control?.closest('label');
    if (label) label.classList.add('legacy-appearance-field');
  }
}

function bindAppearanceControls(showToast) {
  for (const id of controlIds) {
    const element = document.getElementById(id);
    if (!element || element.dataset.boundAppearanceParity === 'true') continue;
    element.dataset.boundAppearanceParity = 'true';
  }

  document.getElementById('appearance-mode-select')?.addEventListener('change', (event) => {
    updateActiveLayer({ appearanceMode: event.target.value });
  });
  document.getElementById('render-choice-button')?.addEventListener('click', () => {
    const layer = getActiveLayer();
    if (!layer) return;
    if ((layer.appearanceMode || 'shape') === 'custom') {
      document.getElementById('custom-texture-input')?.click();
      return;
    }
    openChoiceDialog(layer);
  });
  document.getElementById('blend-mode-select')?.addEventListener('change', (event) => updateActiveLayer({ blendMode: event.target.value }));
  document.getElementById('tint-mode-select')?.addEventListener('change', (event) => updateActiveLayer({ tintMode: event.target.value }));
  document.getElementById('texture-fit-select')?.addEventListener('change', (event) => updateActiveLayer({ textureFit: event.target.value }));
  document.getElementById('reverse-toggle')?.addEventListener('change', (event) => updateActiveLayer({ reverseColor: event.target.checked }));
  bindNumberRange('rotation-input', 'rotation-output', 'rotation');
  bindNumberRange('edge-blur-input', 'edge-blur-output', 'edgeBlur');
  bindNumberRange('texture-alpha-input', 'texture-alpha-output', 'textureAlpha');

  document.getElementById('stop-color-input')?.addEventListener('input', (event) => updateActiveStop({ color: event.target.value }));
  document.getElementById('stop-opacity-input')?.addEventListener('input', (event) => updateActiveStop({ opacity: Number(event.target.value) }));
  document.getElementById('stop-size-input')?.addEventListener('input', (event) => updateActiveStop({ size: Number(event.target.value) }));
  document.getElementById('stop-glow-input')?.addEventListener('input', (event) => updateActiveStop({ glow: Number(event.target.value) }));
  document.getElementById('add-stop-button')?.addEventListener('click', () => addAppearanceStop(showToast));
  document.getElementById('delete-stop-button')?.addEventListener('click', () => deleteAppearanceStop(showToast));

  document.getElementById('custom-texture-input')?.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      updateActiveLayer({ appearanceMode: 'custom', textureName: file.name, textureDataUrl: String(reader.result || '') });
      showToast(`Custom texture loaded: ${file.name}`, 'success');
    });
    reader.readAsDataURL(file);
  });
}

function openChoiceDialog(layer) {
  const mode = layer.appearanceMode || 'shape';
  const choices = mode === 'brush' ? BRUSH_CHOICES : SHAPE_CHOICES;
  const property = mode === 'brush' ? 'builtInBrush' : 'particleShape';
  const dialog = document.getElementById('appearance-choice-dialog');
  const title = document.getElementById('appearance-choice-title');
  const list = document.getElementById('appearance-choice-list');
  if (!dialog || !title || !list) return;
  title.textContent = mode === 'brush' ? 'Choose Brush' : 'Choose Shape';
  list.innerHTML = '';
  choices.forEach(([value, label]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.title = `Use ${label}`;
    if (layer[property] === value) button.classList.add('is-accent');
    button.addEventListener('click', () => {
      updateActiveLayer({ [property]: value, appearanceMode: mode });
      dialog.close();
    });
    list.append(button);
  });
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}

function bindNumberRange(inputId, outputId, property) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('input', () => {
    const value = Number(input.value);
    document.getElementById(outputId).textContent = String(value);
    updateActiveLayer({ [property]: value });
  });
}

function updateActiveStop(patch) {
  const layer = getActiveLayer();
  if (!layer) return;
  const stops = getStops(layer);
  const index = clampIndex(layer.activeAppearanceStopIndex || 0, stops);
  stops[index] = { ...stops[index], ...patch };
  updateActiveLayer({ appearanceStops: sanitizeStops(stops), activeAppearanceStopIndex: index });
}

function addAppearanceStop(showToast) {
  const layer = getActiveLayer();
  if (!layer) return;
  const stops = getStops(layer);
  if (stops.length >= 5) {
    showToast('Maximum 5 appearance markers.', 'warn');
    return;
  }
  const active = stops[clampIndex(layer.activeAppearanceStopIndex || 0, stops)] || stops[0];
  const open = findOpenStopPosition(stops);
  const nextStops = sanitizeStops([...stops, { id: `stop_${Date.now().toString(36)}`, position: open, color: active.color, opacity: active.opacity, size: active.size, glow: active.glow }]);
  const index = nextStops.findIndex((stop) => stop.position === open);
  updateActiveLayer({ appearanceStops: nextStops, activeAppearanceStopIndex: Math.max(0, index) });
  showToast('Appearance marker added.', 'success');
}

function deleteAppearanceStop(showToast) {
  const layer = getActiveLayer();
  if (!layer) return;
  const stops = getStops(layer);
  if (stops.length <= 1) {
    showToast('Minimum 1 appearance marker.', 'warn');
    return;
  }
  const index = clampIndex(layer.activeAppearanceStopIndex || 0, stops);
  stops.splice(index, 1);
  const nextStops = sanitizeStops(stops);
  updateActiveLayer({ appearanceStops: nextStops, activeAppearanceStopIndex: Math.min(index, nextStops.length - 1) });
  showToast('Appearance marker deleted.', 'warn');
}

function syncAppearanceControls() {
  const layer = getActiveLayer();
  const disabled = !layer;
  const byId = (id) => document.getElementById(id);

  for (const id of controlIds) {
    const element = byId(id);
    if (element) element.disabled = disabled;
  }
  if (!layer) return;

  const stops = getStops(layer);
  if (!Array.isArray(layer.appearanceStops) || !layer.appearanceStops.length) layer.appearanceStops = stops;
  renderStopTrack(layer, stops);
  syncStopEditor(layer, stops);

  setValue('appearance-mode-select', layer.appearanceMode || 'shape');
  syncRenderChoice(layer);
  setValue('blend-mode-select', layer.blendMode || defaultBlendMode(layer.engine));
  setValue('tint-mode-select', layer.tintMode || 'tint');
  setValue('texture-fit-select', layer.textureFit || 'contain');
  setValue('rotation-input', finite(layer.rotation, 0));
  setValue('edge-blur-input', finite(layer.edgeBlur, 0));
  setValue('texture-alpha-input', finite(layer.textureAlpha, 1));

  const reverseToggle = byId('reverse-toggle');
  if (reverseToggle) reverseToggle.checked = Boolean(layer.reverseColor);
  byId('rotation-output').textContent = String(finite(layer.rotation, 0));
  byId('edge-blur-output').textContent = String(finite(layer.edgeBlur, 0));
  byId('texture-alpha-output').textContent = String(finite(layer.textureAlpha, 1));

  const textureStatus = byId('texture-status');
  if (textureStatus) {
    textureStatus.hidden = (layer.appearanceMode || 'shape') !== 'custom';
    textureStatus.textContent = layer.textureName ? `Loaded: ${layer.textureName}` : 'No custom texture loaded';
  }
}

function syncRenderChoice(layer) {
  const mode = layer.appearanceMode || 'shape';
  const title = document.getElementById('render-choice-title');
  const button = document.getElementById('render-choice-button');
  if (!button || !title) return;
  button.classList.toggle('is-file', mode === 'custom');
  if (mode === 'brush') {
    title.textContent = 'Brush';
    button.textContent = labelForChoice(BRUSH_CHOICES, layer.builtInBrush || 'spark');
    button.title = 'Choose a built-in brush from the brush library.';
  } else if (mode === 'custom') {
    title.textContent = 'Image Brush';
    button.textContent = layer.textureName || 'Choose Image Brush';
    button.title = 'Choose a custom transparent PNG/WebP/JPG brush texture.';
  } else {
    title.textContent = 'Shape';
    button.textContent = labelForChoice(SHAPE_CHOICES, layer.particleShape || 'circle');
    button.title = 'Choose a particle shape from the shape library.';
  }
}

function renderStopTrack(layer, stops) {
  const preview = document.getElementById('appearance-ramp-preview');
  const track = document.getElementById('appearance-stop-track');
  if (!preview || !track) return;
  preview.style.background = rampGradient(stops);
  const selected = clampIndex(layer.activeAppearanceStopIndex || 0, stops);
  track.innerHTML = '';
  stops.forEach((stop, index) => {
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = `appearance-stop-marker ${index === selected ? 'is-selected' : ''}`;
    marker.style.left = `${stop.position * 100}%`;
    marker.style.setProperty('--stop-color', stop.color);
    marker.title = `Stop ${index + 1} · ${Math.round(stop.position * 100)}%`;
    marker.addEventListener('click', () => updateActiveLayer({ activeAppearanceStopIndex: index }));
    marker.addEventListener('pointerdown', (event) => startMarkerDrag(event, stop.id));
    track.append(marker);
  });
}

function startMarkerDrag(event, stopId) {
  event.preventDefault();
  event.stopPropagation();
  const track = document.getElementById('appearance-stop-track');
  if (!getActiveLayer() || !track || !stopId) return;
  document.body.classList.add('is-dragging-appearance-stop');

  const updateFromEvent = (moveEvent) => {
    const layer = getActiveLayer();
    if (!layer) return;
    const stops = getStops(layer);
    const index = stops.findIndex((stop) => stop.id === stopId);
    if (index < 0) return;
    const rect = track.getBoundingClientRect();
    const raw = (moveEvent.clientX - rect.left) / Math.max(1, rect.width);
    const snapped = Math.round(clamp(raw, 0, 1) * 10) / 10;
    const nextStops = stops.map((stop) => stop.id === stopId ? { ...stop, position: snapped } : { ...stop });
    const sanitized = sanitizeStops(nextStops);
    const nextIndex = sanitized.findIndex((stop) => stop.id === stopId);
    updateActiveLayer({ appearanceStops: sanitized, activeAppearanceStopIndex: Math.max(0, nextIndex) });
  };

  const stopDrag = () => {
    document.body.classList.remove('is-dragging-appearance-stop');
    window.removeEventListener('pointermove', updateFromEvent);
    window.removeEventListener('pointerup', stopDrag);
    window.removeEventListener('pointercancel', stopDrag);
  };

  window.addEventListener('pointermove', updateFromEvent);
  window.addEventListener('pointerup', stopDrag);
  window.addEventListener('pointercancel', stopDrag);
  updateFromEvent(event);
}

function syncStopEditor(layer, stops) {
  const index = clampIndex(layer.activeAppearanceStopIndex || 0, stops);
  const stop = stops[index];
  setValue('stop-color-input', stop.color);
  setValue('stop-opacity-input', stop.opacity);
  setValue('stop-size-input', stop.size);
  setValue('stop-glow-input', stop.glow);
  setText('stop-opacity-output', stop.opacity);
  setText('stop-size-output', stop.size);
  setText('stop-glow-output', stop.glow);
  setText('selected-stop-readout', `Stop ${index + 1} · ${Math.round(stop.position * 100)}%`);
  const deleteButton = document.getElementById('delete-stop-button');
  if (deleteButton) deleteButton.disabled = stops.length <= 1;
  const addButton = document.getElementById('add-stop-button');
  if (addButton) addButton.disabled = stops.length >= 5;
}

function getStops(layer) {
  const raw = Array.isArray(layer.appearanceStops) && layer.appearanceStops.length
    ? layer.appearanceStops
    : [
      { id: 'legacy_start', position: 0, color: layer.colorA || '#ffcc66', opacity: finite(layer.alphaStart, 1), size: finite(layer.sizeStart, 20), glow: finite(layer.glow, 12) },
      { id: 'legacy_end', position: 1, color: layer.colorB || '#ff6600', opacity: finite(layer.alphaEnd, 0), size: finite(layer.sizeEnd, 4), glow: 0 }
    ];
  return sanitizeStops(raw);
}

function sanitizeStops(stops) {
  const mapped = stops.slice(0, 5).map((stop, index) => ({
    id: stop.id || `stop_${index}_${Date.now().toString(36)}`,
    position: Math.round(clamp(Number(stop.position) || 0, 0, 1) * 10) / 10,
    color: normalizeHex(stop.color),
    opacity: clamp(Number(stop.opacity), 0, 1),
    size: clamp(Number(stop.size), 0, 180),
    glow: clamp(Number(stop.glow), 0, 80)
  })).sort((a, b) => a.position - b.position);
  if (!mapped.length) return [{ id: `stop_${Date.now().toString(36)}`, position: 0, color: '#ffcc66', opacity: 1, size: 20, glow: 12 }];
  if (mapped.length > 1) {
    mapped[0].position = 0;
    mapped[mapped.length - 1].position = 1;
  }
  for (let index = 1; index < mapped.length; index += 1) {
    if (mapped[index].position <= mapped[index - 1].position) {
      mapped[index].position = Math.min(1, Math.round((mapped[index - 1].position + 0.1) * 10) / 10);
    }
  }
  return mapped;
}

function rampGradient(stops) {
  if (stops.length === 1) return stops[0].color;
  return `linear-gradient(to right, ${stops.map((stop) => `${stop.color} ${Math.round(stop.position * 100)}%`).join(', ')})`;
}
function findOpenStopPosition(stops) {
  const used = new Set(stops.map((stop) => Math.round(stop.position * 10)));
  for (const candidate of [5, 3, 7, 2, 4, 6, 8, 1, 9]) if (!used.has(candidate)) return candidate / 10;
  return 0.5;
}
function labelForChoice(choices, value) { return choices.find(([choice]) => choice === value)?.[1] || choices[0][1]; }
function setValue(id, value) { const element = document.getElementById(id); if (element && String(element.value) !== String(value)) element.value = value; }
function setText(id, value) { const element = document.getElementById(id); if (element) element.textContent = String(value); }
function normalizeHex(value) {
  const string = String(value || '').trim();
  if (/^#[0-9a-f]{6}$/iu.test(string)) return string;
  if (/^#[0-9a-f]{3}$/iu.test(string)) return `#${string.slice(1).split('').map((char) => char + char).join('')}`;
  return '#ffcc66';
}
function clampIndex(value, stops) { return Math.min(Math.max(0, Math.round(Number(value) || 0)), Math.max(0, stops.length - 1)); }
function clamp(value, min, max) { const number = Number.isFinite(Number(value)) ? Number(value) : min; return Math.min(max, Math.max(min, number)); }
function defaultBlendMode(engine) { return engine === 'gas' || engine === 'refraction' ? 'source-over' : 'lighter'; }
function finite(value, fallback) { const number = Number(value); return Number.isFinite(number) ? number : fallback; }
