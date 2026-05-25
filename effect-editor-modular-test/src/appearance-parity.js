import { getActiveLayer, onStateChange, updateActiveLayer } from './editor-state.js';

const controlIds = [
  'appearance-mode-select',
  'particle-shape-select',
  'brush-select',
  'blend-mode-select',
  'tint-mode-select',
  'texture-fit-select',
  'reverse-toggle',
  'rotation-input',
  'edge-blur-input',
  'texture-alpha-input',
  'custom-texture-input'
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
    .appearance-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .appearance-grid label { margin: 0; }
    .appearance-wide { grid-column: 1 / -1; }
    .inline-toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 11px 0; color: var(--gold-muted); font-size: 10px; text-transform: uppercase; letter-spacing: .12em; font-weight: 800; }
    .inline-toggle-row input { width: auto; accent-color: var(--purple2); }
    .texture-file-label { border: 1px dashed rgba(226,204,167,.24); border-radius: 12px; padding: 10px; background: rgba(15,12,11,.5); cursor: pointer; }
    .texture-file-label input { display: none; }
    .texture-status { margin-top: 7px; color: var(--muted); font-size: 11px; text-transform: none; letter-spacing: .02em; font-weight: 500; }
  `;
  document.head.append(style);
}

function ensureAppearanceControls() {
  const cards = Array.from(document.querySelectorAll('#left-panel .card'));
  const appearanceCard = cards.find((card) => card.querySelector('h2')?.textContent?.trim() === 'Effect Layer Appearance');
  if (!appearanceCard || document.getElementById('appearance-mode-select')) return;

  appearanceCard.insertAdjacentHTML('beforeend', `
    <div class="appearance-grid">
      <label class="appearance-wide">Particle Render Mode
        <select id="appearance-mode-select">
          <option value="shape">Shape</option>
          <option value="brush">Built-in Brush</option>
          <option value="custom">Custom Image Brush</option>
        </select>
      </label>
      <label>Shape
        <select id="particle-shape-select">
          <option value="circle">Circle / Soft Orb</option>
          <option value="square">Square</option>
          <option value="diamond">Diamond</option>
          <option value="star">Star Spark</option>
          <option value="slash">Slash Stroke</option>
        </select>
      </label>
      <label>Built-in Brush
        <select id="brush-select">
          <option value="spark">Spark</option>
          <option value="soft-dot">Soft Dot</option>
          <option value="smoke-puff">Smoke Puff</option>
          <option value="slash">Slash Stroke</option>
          <option value="flare">Flare Cross</option>
        </select>
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
      <label class="appearance-wide">Texture Opacity
        <input id="texture-alpha-input" type="range" min="0" max="1" step="0.01" value="1" />
        <output id="texture-alpha-output">1</output>
      </label>
    </div>
    <label class="texture-file-label">Custom Image Brush
      <input id="custom-texture-input" type="file" accept="image/png,image/webp,image/jpeg" />
      <span>Choose a transparent PNG/WebP/JPG brush texture</span>
      <div id="texture-status" class="texture-status">No custom texture loaded</div>
    </label>
    <label class="inline-toggle-row">Reverse Colour Gradient
      <input id="reverse-toggle" type="checkbox" />
    </label>
  `);
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
  document.getElementById('particle-shape-select')?.addEventListener('change', (event) => {
    updateActiveLayer({ particleShape: event.target.value });
  });
  document.getElementById('brush-select')?.addEventListener('change', (event) => {
    updateActiveLayer({ builtInBrush: event.target.value, appearanceMode: 'brush' });
  });
  document.getElementById('blend-mode-select')?.addEventListener('change', (event) => {
    updateActiveLayer({ blendMode: event.target.value });
  });
  document.getElementById('tint-mode-select')?.addEventListener('change', (event) => {
    updateActiveLayer({ tintMode: event.target.value });
  });
  document.getElementById('texture-fit-select')?.addEventListener('change', (event) => {
    updateActiveLayer({ textureFit: event.target.value });
  });
  document.getElementById('reverse-toggle')?.addEventListener('change', (event) => {
    updateActiveLayer({ reverseColor: event.target.checked });
  });
  bindNumberRange('rotation-input', 'rotation-output', 'rotation');
  bindNumberRange('edge-blur-input', 'edge-blur-output', 'edgeBlur');
  bindNumberRange('texture-alpha-input', 'texture-alpha-output', 'textureAlpha');

  document.getElementById('custom-texture-input')?.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      updateActiveLayer({
        appearanceMode: 'custom',
        textureName: file.name,
        textureDataUrl: String(reader.result || '')
      });
      showToast(`Custom texture loaded: ${file.name}`, 'success');
    });
    reader.readAsDataURL(file);
  });
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

function syncAppearanceControls() {
  const layer = getActiveLayer();
  const disabled = !layer;
  const byId = (id) => document.getElementById(id);

  for (const id of controlIds) {
    const element = byId(id);
    if (element) element.disabled = disabled;
  }

  if (!layer) return;

  setValue('appearance-mode-select', layer.appearanceMode || 'shape');
  setValue('particle-shape-select', layer.particleShape || 'circle');
  setValue('brush-select', layer.builtInBrush || 'spark');
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
    textureStatus.textContent = layer.textureName ? `Loaded: ${layer.textureName}` : 'No custom texture loaded';
  }
}

function setValue(id, value) {
  const element = document.getElementById(id);
  if (element && String(element.value) !== String(value)) element.value = value;
}

function defaultBlendMode(engine) {
  return engine === 'gas' || engine === 'refraction' ? 'source-over' : 'lighter';
}

function finite(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
