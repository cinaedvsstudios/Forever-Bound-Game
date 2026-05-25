import { editorState, getDesignHeight, getDesignWidth, onStateChange, setDesignSize } from './editor-state.js';

export function initResolutionParity(showToast = () => {}) {
  injectResolutionStyles();
  ensureResolutionMenu(showToast);
  syncResolutionControls();
  onStateChange(syncResolutionControls);
}

function injectResolutionStyles() {
  if (document.getElementById('resolution-parity-style')) return;
  const style = document.createElement('style');
  style.id = 'resolution-parity-style';
  style.textContent = `
    .resolution-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 8px 0; }
    .resolution-row label { margin: 0; }
    .resolution-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
    .resolution-actions button { min-height: 32px; font-size: 11px; text-align: center; }
    .resolution-note { color: var(--muted); font-size: 11px; line-height: 1.35; margin: 8px 4px 0; }
  `;
  document.head.append(style);
}

function ensureResolutionMenu(showToast) {
  const filePanel = document.getElementById('menu-file');
  if (!filePanel || document.getElementById('resolution-width-input')) return;

  filePanel.insertAdjacentHTML('beforeend', `
    <div class="menu-divider"></div>
    <div class="menu-section-title">Scene / FX Resolution</div>
    <div class="resolution-row">
      <label>Width<input id="resolution-width-input" type="number" min="320" max="4096" step="1" value="1280" /></label>
      <label>Height<input id="resolution-height-input" type="number" min="180" max="4096" step="1" value="720" /></label>
    </div>
    <div class="resolution-actions">
      <button id="apply-resolution-button" type="button">Apply Size</button>
      <button id="scale-resolution-button" type="button">Scale Content</button>
      <button id="preset-720p-button" type="button">1280×720</button>
      <button id="preset-1080p-button" type="button">1920×1080</button>
      <button id="preset-square-button" type="button">1024×1024</button>
      <button id="preset-portrait-button" type="button">1080×1920</button>
    </div>
    <p class="resolution-note">Resolution changes update the composition stage size. “Apply Size” keeps coordinates clamped; “Scale Content” rescales emitters and targets.</p>
  `);

  document.getElementById('apply-resolution-button')?.addEventListener('click', () => {
    applyResolution(false, showToast);
  });
  document.getElementById('scale-resolution-button')?.addEventListener('click', () => {
    applyResolution(true, showToast);
  });
  document.getElementById('preset-720p-button')?.addEventListener('click', () => setPreset(1280, 720));
  document.getElementById('preset-1080p-button')?.addEventListener('click', () => setPreset(1920, 1080));
  document.getElementById('preset-square-button')?.addEventListener('click', () => setPreset(1024, 1024));
  document.getElementById('preset-portrait-button')?.addEventListener('click', () => setPreset(1080, 1920));
}

function applyResolution(scaleContent, showToast) {
  const width = Number(document.getElementById('resolution-width-input')?.value || getDesignWidth());
  const height = Number(document.getElementById('resolution-height-input')?.value || getDesignHeight());
  setDesignSize(width, height, { scaleContent });
  editorState.particles = [];
  showToast(`Stage set to ${getDesignWidth()}×${getDesignHeight()}${scaleContent ? ' and content scaled' : ''}.`, 'success');
}

function setPreset(width, height) {
  const widthInput = document.getElementById('resolution-width-input');
  const heightInput = document.getElementById('resolution-height-input');
  if (widthInput) widthInput.value = width;
  if (heightInput) heightInput.value = height;
}

function syncResolutionControls() {
  const widthInput = document.getElementById('resolution-width-input');
  const heightInput = document.getElementById('resolution-height-input');
  if (widthInput && String(widthInput.value) !== String(getDesignWidth())) widthInput.value = getDesignWidth();
  if (heightInput && String(heightInput.value) !== String(getDesignHeight())) heightInput.value = getDesignHeight();
}
