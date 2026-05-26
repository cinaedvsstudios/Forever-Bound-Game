import { getActiveLayer, onStateChange, updateActiveLayer } from './editor-state.js';

export function initBrushRenderControls(showToast = () => {}) {
  injectBrushControlStyles();
  ensureBrushControls();
  syncBrushControls();
  bindBrushControls(showToast);
  onStateChange(syncBrushControls);
}

function injectBrushControlStyles() {
  if (document.getElementById('brush-render-controls-style')) return;
  const style = document.createElement('style');
  style.id = 'brush-render-controls-style';
  style.textContent = `
    .brush-rotation-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      grid-column: 1 / -1;
    }
    .brush-rotation-row label { margin: 0; }
  `;
  document.head.append(style);
}

function ensureBrushControls() {
  const blendSelect = document.getElementById('blend-mode-select');
  if (blendSelect && !blendSelect.querySelector('option[value="source-over"]')?.textContent.includes('Normal')) {
    const sourceOption = blendSelect.querySelector('option[value="source-over"]');
    if (sourceOption) sourceOption.textContent = 'Normal';
    const lighterOption = blendSelect.querySelector('option[value="lighter"]');
    if (lighterOption) lighterOption.textContent = 'Additive Glow';
  }

  if (!document.getElementById('rotation-mode-select')) {
    const rotationLabel = document.getElementById('rotation-input')?.closest('label');
    if (rotationLabel) {
      rotationLabel.insertAdjacentHTML('afterend', `
        <div class="brush-rotation-row">
          <label>Rotation Mode
            <select id="rotation-mode-select">
              <option value="random">Random Spin</option>
              <option value="fixed">Follow Rotate</option>
            </select>
          </label>
          <label>Rotation Variation
            <input id="rotation-jitter-input" type="range" min="0" max="45" step="1" value="5" />
            <output id="rotation-jitter-output">5°</output>
          </label>
        </div>
      `);
    }
  }

  if (!document.getElementById('texture-contrast-input')) {
    const textureAlphaLabel = document.getElementById('texture-alpha-input')?.closest('label');
    if (textureAlphaLabel) {
      textureAlphaLabel.insertAdjacentHTML('afterend', `
        <label>PNG Contrast
          <input id="texture-contrast-input" type="range" min="0" max="3" step="0.05" value="1" />
          <output id="texture-contrast-output">1</output>
        </label>
      `);
    }
  }
}

function bindBrushControls(showToast) {
  const rotationMode = document.getElementById('rotation-mode-select');
  if (rotationMode && rotationMode.dataset.boundBrushControls !== 'true') {
    rotationMode.dataset.boundBrushControls = 'true';
    rotationMode.addEventListener('change', () => {
      updateActiveLayer({ rotationMode: rotationMode.value });
      showToast(rotationMode.value === 'fixed' ? 'Particle rotation now follows Rotate.' : 'Particle rotation now uses random spin.', 'info');
    });
  }

  const jitter = document.getElementById('rotation-jitter-input');
  if (jitter && jitter.dataset.boundBrushControls !== 'true') {
    jitter.dataset.boundBrushControls = 'true';
    jitter.addEventListener('input', () => {
      const value = Number(jitter.value);
      document.getElementById('rotation-jitter-output').textContent = `${value}°`;
      updateActiveLayer({ rotationJitter: value });
    });
  }

  const contrast = document.getElementById('texture-contrast-input');
  if (contrast && contrast.dataset.boundBrushControls !== 'true') {
    contrast.dataset.boundBrushControls = 'true';
    contrast.addEventListener('input', () => {
      const value = Number(contrast.value);
      document.getElementById('texture-contrast-output').textContent = value.toFixed(2).replace(/\.00$/u, '');
      updateActiveLayer({ textureContrast: value });
    });
  }
}

function syncBrushControls() {
  const layer = getActiveLayer();
  const disabled = !layer;
  const rotationMode = document.getElementById('rotation-mode-select');
  const jitter = document.getElementById('rotation-jitter-input');
  const contrast = document.getElementById('texture-contrast-input');

  if (rotationMode) {
    rotationMode.disabled = disabled;
    rotationMode.value = layer?.rotationMode || 'random';
  }
  if (jitter) {
    jitter.disabled = disabled || (layer?.rotationMode || 'random') !== 'fixed';
    const value = finite(layer?.rotationJitter, 5);
    jitter.value = String(value);
    const output = document.getElementById('rotation-jitter-output');
    if (output) output.textContent = `${value}°`;
  }
  if (contrast) {
    contrast.disabled = disabled;
    const value = finite(layer?.textureContrast, 1);
    contrast.value = String(value);
    const output = document.getElementById('texture-contrast-output');
    if (output) output.textContent = Number(value).toFixed(2).replace(/\.00$/u, '');
  }
}

function finite(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
