import { DESIGN_WIDTH, DESIGN_HEIGHT, getActiveLayer, onStateChange, updateActiveLayer } from './editor-state.js';

const controlIds = [
  'emitter-width-input',
  'emitter-width-unit-select',
  'emitter-rotation-input',
  'target-x-input',
  'target-y-input',
  'reverse-near-target-toggle',
  'friction-input',
  'orbital-force-input',
  'lifetime-min-input',
  'lifetime-max-input',
  'noise-grain-input'
];

export function initDynamicsParity(showToast = () => {}) {
  injectDynamicsStyles();
  ensureDynamicsControls();
  bindDynamicsControls(showToast);
  syncDynamicsControls();
  onStateChange(syncDynamicsControls);
}

function injectDynamicsStyles() {
  if (document.getElementById('dynamics-parity-style')) return;
  const style = document.createElement('style');
  style.id = 'dynamics-parity-style';
  style.textContent = `
    .dynamics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; }
    .dynamics-grid label { margin: 0; }
    .dynamics-wide { grid-column: 1 / -1; }
    .dynamics-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 12px 0; }
    .dynamics-actions button { min-height: 36px; text-align: center; font-size: 11px; }
    .dynamics-note { color: var(--muted); font-size: 11px; line-height: 1.35; margin: 8px 0 0; }
    .dynamics-toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 0; color: var(--gold-muted); font-size: 10px; text-transform: uppercase; letter-spacing: .12em; font-weight: 800; }
    .dynamics-toggle-row input { width: auto; accent-color: var(--purple2); }
  `;
  document.head.append(style);
}

function ensureDynamicsControls() {
  const cards = Array.from(document.querySelectorAll('#left-panel .card'));
  const dynamicsCard = cards.find((card) => card.querySelector('h2')?.textContent?.trim() === 'Effect Layer Dynamics');
  if (!dynamicsCard || document.getElementById('emitter-width-input')) return;

  dynamicsCard.insertAdjacentHTML('beforeend', `
    <div class="dynamics-actions">
      <button id="set-origin-button" type="button">Set Origin Center</button>
      <button id="point-target-button" type="button">Point To Target</button>
    </div>
    <div class="dynamics-grid">
      <label>Emitter Width
        <input id="emitter-width-input" type="range" min="0" max="400" step="1" value="0" />
        <output id="emitter-width-output">0</output>
      </label>
      <label>Width Unit
        <select id="emitter-width-unit-select">
          <option value="px">Pixels</option>
          <option value="percent">Percent Stage</option>
        </select>
      </label>
      <label>Emitter Rotation
        <input id="emitter-rotation-input" type="range" min="-180" max="180" step="1" value="0" />
        <output id="emitter-rotation-output">0</output>
      </label>
      <label>Friction
        <input id="friction-input" type="range" min="0" max="0.08" step="0.001" value="0" />
        <output id="friction-output">0</output>
      </label>
      <label>Target X
        <input id="target-x-input" type="number" min="0" max="1280" step="1" value="640" />
      </label>
      <label>Target Y
        <input id="target-y-input" type="number" min="0" max="720" step="1" value="360" />
      </label>
      <label>Lifetime Min
        <input id="lifetime-min-input" type="range" min="4" max="300" step="1" value="60" />
        <output id="lifetime-min-output">60</output>
      </label>
      <label>Lifetime Max
        <input id="lifetime-max-input" type="range" min="4" max="360" step="1" value="110" />
        <output id="lifetime-max-output">110</output>
      </label>
      <label>Orbital Force
        <input id="orbital-force-input" type="range" min="-0.1" max="0.1" step="0.001" value="0" />
        <output id="orbital-force-output">0</output>
      </label>
      <label>Noise Grain
        <input id="noise-grain-input" type="range" min="0" max="1" step="0.01" value="0" />
        <output id="noise-grain-output">0</output>
      </label>
      <label class="dynamics-toggle-row dynamics-wide">Reverse Near Target
        <input id="reverse-near-target-toggle" type="checkbox" />
      </label>
    </div>
    <p class="dynamics-note">Dynamics controls are restored as modular state. Width, rotation, friction, lifetime range, orbital force, and noise grain are now wired into the runtime.</p>
  `);
}

function bindDynamicsControls(showToast) {
  bindNumberRange('emitter-width-input', 'emitter-width-output', 'emitterWidth');
  bindNumberRange('emitter-rotation-input', 'emitter-rotation-output', 'emitterRotation');
  bindNumberRange('friction-input', 'friction-output', 'friction');
  bindNumberRange('lifetime-min-input', 'lifetime-min-output', 'lifetimeMin');
  bindNumberRange('lifetime-max-input', 'lifetime-max-output', 'lifetimeMax');
  bindNumberRange('orbital-force-input', 'orbital-force-output', 'orbitalForce');
  bindNumberRange('noise-grain-input', 'noise-grain-output', 'noiseGrain');

  document.getElementById('emitter-width-unit-select')?.addEventListener('change', (event) => {
    updateActiveLayer({ emitterWidthUnit: event.target.value });
  });
  document.getElementById('target-x-input')?.addEventListener('input', (event) => {
    updateActiveLayer({ targetX: Number(event.target.value) });
  });
  document.getElementById('target-y-input')?.addEventListener('input', (event) => {
    updateActiveLayer({ targetY: Number(event.target.value) });
  });
  document.getElementById('reverse-near-target-toggle')?.addEventListener('change', (event) => {
    updateActiveLayer({ reverseNearTarget: event.target.checked });
  });
  document.getElementById('set-origin-button')?.addEventListener('click', () => {
    updateActiveLayer({ emitterX: DESIGN_WIDTH / 2, emitterY: DESIGN_HEIGHT / 2 });
    showToast('Emitter origin set to stage center.', 'success');
  });
  document.getElementById('point-target-button')?.addEventListener('click', () => {
    const layer = getActiveLayer();
    if (!layer) return;
    const angle = Math.atan2((layer.targetY ?? DESIGN_HEIGHT / 2) - layer.emitterY, (layer.targetX ?? DESIGN_WIDTH / 2) - layer.emitterX) * 180 / Math.PI;
    updateActiveLayer({ angle: Math.round(angle) });
    showToast('Layer direction pointed to target.', 'success');
  });

  for (const id of controlIds) {
    const element = document.getElementById(id);
    if (element) element.dataset.boundDynamicsParity = 'true';
  }
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

function syncDynamicsControls() {
  const layer = getActiveLayer();
  const disabled = !layer;
  for (const id of controlIds) {
    const element = document.getElementById(id);
    if (element) element.disabled = disabled;
  }
  document.getElementById('set-origin-button')?.toggleAttribute('disabled', disabled);
  document.getElementById('point-target-button')?.toggleAttribute('disabled', disabled);
  if (!layer) return;

  setValue('emitter-width-input', finite(layer.emitterWidth, 0));
  setValue('emitter-width-unit-select', layer.emitterWidthUnit || 'px');
  setValue('emitter-rotation-input', finite(layer.emitterRotation, 0));
  setValue('target-x-input', finite(layer.targetX, DESIGN_WIDTH / 2));
  setValue('target-y-input', finite(layer.targetY, DESIGN_HEIGHT / 2));
  setValue('friction-input', finite(layer.friction, 0));
  setValue('lifetime-min-input', finite(layer.lifetimeMin, Math.max(4, finite(layer.lifetime, 80) * 0.75)));
  setValue('lifetime-max-input', finite(layer.lifetimeMax, Math.max(4, finite(layer.lifetime, 80) * 1.25)));
  setValue('orbital-force-input', finite(layer.orbitalForce, 0));
  setValue('noise-grain-input', finite(layer.noiseGrain, 0));

  setText('emitter-width-output', finite(layer.emitterWidth, 0));
  setText('emitter-rotation-output', finite(layer.emitterRotation, 0));
  setText('friction-output', finite(layer.friction, 0));
  setText('lifetime-min-output', finite(layer.lifetimeMin, Math.max(4, finite(layer.lifetime, 80) * 0.75)));
  setText('lifetime-max-output', finite(layer.lifetimeMax, Math.max(4, finite(layer.lifetime, 80) * 1.25)));
  setText('orbital-force-output', finite(layer.orbitalForce, 0));
  setText('noise-grain-output', finite(layer.noiseGrain, 0));

  const reverse = document.getElementById('reverse-near-target-toggle');
  if (reverse) reverse.checked = Boolean(layer.reverseNearTarget);
}

function setValue(id, value) {
  const element = document.getElementById(id);
  if (element && String(element.value) !== String(value)) element.value = value;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = String(value);
}

function finite(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
