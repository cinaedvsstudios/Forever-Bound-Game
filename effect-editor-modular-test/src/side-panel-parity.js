import { getActiveLayer, onStateChange } from './editor-state.js';

let currentThumbnailDataUrl = '';

const ENGINE_LABELS = new Map([
  ['particles', 'Standard Particle Engine'],
  ['lightning', 'Lightning / Beam Engine'],
  ['ribbon', 'Trail / Ribbon Engine'],
  ['ring', 'Ring / Shockwave Engine'],
  ['projectile', 'Projectile / Trail Engine'],
  ['gas', 'Gas / Smoke / Dust Engine'],
  ['refraction', 'Refraction / Distortion Engine'],
  ['lensflare', 'Lens Flare / Optical Engine']
]);

export function initSidePanelParity(showToast = () => {}) {
  injectSidePanelStyles();
  ensureEngineReadout();
  ensureThumbnailPanel(showToast);
  syncEngineReadout();
  onStateChange(syncEngineReadout);
}

function injectSidePanelStyles() {
  if (document.getElementById('side-panel-parity-style')) return;
  const style = document.createElement('style');
  style.id = 'side-panel-parity-style';
  style.textContent = `
    .engine-readout {
      margin-top: -4px;
      padding: 8px 10px;
      border: 1px solid rgba(56,42,33,.76);
      border-radius: 11px;
      color: var(--gold-bright);
      background: rgba(15,12,11,.82);
      font-size: 11px;
      text-transform: none;
      letter-spacing: .02em;
      box-shadow: inset 0 2px 6px rgba(0,0,0,.45);
    }
    .thumbnail-panel {
      margin-top: 13px;
      border: 1px solid rgba(56,42,33,.76);
      border-radius: 15px;
      padding: 10px;
      background: rgba(15,12,11,.48);
    }
    .thumbnail-panel h3 {
      margin: 0 0 8px;
      font-family: 'Cinzel', Georgia, serif;
      color: var(--gold-bright);
      font-size: 11px;
      letter-spacing: .14em;
      text-transform: uppercase;
    }
    .thumbnail-frame {
      min-height: 96px;
      display: grid;
      place-items: center;
      border: 1px dashed rgba(226,204,167,.25);
      border-radius: 12px;
      overflow: hidden;
      background: rgba(0,0,0,.28);
      color: var(--gold-muted);
      font-size: 11px;
      text-align: center;
    }
    .thumbnail-frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: none;
    }
    .thumbnail-frame.has-image img { display: block; }
    .thumbnail-frame.has-image span { display: none; }
    .thumbnail-hint {
      margin: 8px 0;
      color: var(--muted);
      font-size: 11px;
      line-height: 1.35;
    }
    .thumbnail-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .thumbnail-actions button {
      min-height: 36px;
      text-align: center;
      font-size: 11px;
    }
  `;
  document.head.append(style);
}

function ensureEngineReadout() {
  const select = document.getElementById('engine-select');
  if (!select || document.getElementById('engine-readout')) return;
  const readout = document.createElement('div');
  readout.id = 'engine-readout';
  readout.className = 'engine-readout';
  readout.textContent = 'No active engine selected';
  select.insertAdjacentElement('afterend', readout);
}

function ensureThumbnailPanel(showToast) {
  const firstCard = document.querySelector('#left-panel .card');
  if (!firstCard || document.getElementById('thumbnail-preview-panel')) return;
  firstCard.insertAdjacentHTML('beforeend', `
    <div id="thumbnail-preview-panel" class="thumbnail-panel">
      <h3>Thumbnail Preview</h3>
      <div id="thumbnail-frame" class="thumbnail-frame">
        <img id="thumbnail-preview-img" alt="Captured effect thumbnail" />
        <span>No thumbnail captured yet</span>
      </div>
      <p class="thumbnail-hint">Capture a JPG preview for the current archetype. Default filename uses the Archetype ID.</p>
      <div class="thumbnail-actions">
        <button id="capture-thumbnail-button" type="button">Capture JPG</button>
        <button id="save-thumbnail-button" type="button">Save JPG</button>
      </div>
    </div>
  `);
  document.getElementById('capture-thumbnail-button')?.addEventListener('click', () => captureThumbnailPreview(showToast));
  document.getElementById('save-thumbnail-button')?.addEventListener('click', () => saveThumbnailJPG(showToast));
}

function syncEngineReadout() {
  const layer = getActiveLayer();
  const select = document.getElementById('engine-select');
  const readout = document.getElementById('engine-readout');
  if (!select || !readout) return;
  if (!layer) {
    readout.textContent = 'No active engine selected';
    return;
  }
  ensureEngineOption(select, layer.engine);
  select.value = layer.engine;
  const label = labelForEngine(layer.engine);
  readout.textContent = label;
  select.title = label;
}

function ensureEngineOption(select, value) {
  if (!value) return;
  const exists = Array.from(select.options).some((option) => option.value === value);
  if (!exists) select.append(new Option(labelForEngine(value), value));
}

function labelForEngine(value) {
  return ENGINE_LABELS.get(value) || String(value || 'Unknown Engine').replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function captureThumbnailPreview(showToast) {
  const canvas = document.getElementById('fx-canvas');
  if (!canvas) {
    showToast('Canvas not found. Cannot capture thumbnail.', 'error');
    return;
  }
  currentThumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const img = document.getElementById('thumbnail-preview-img');
  const frame = document.getElementById('thumbnail-frame');
  if (img && frame) {
    img.src = currentThumbnailDataUrl;
    frame.classList.add('has-image');
  }
  showToast('Thumbnail JPG captured from current canvas view.', 'success');
}

function saveThumbnailJPG(showToast) {
  if (!currentThumbnailDataUrl) captureThumbnailPreview(showToast);
  if (!currentThumbnailDataUrl) return;
  const idInput = document.getElementById('archetype-id-input');
  const safeId = String(idInput?.value || 'effect-archetype').trim().replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '') || 'effect-archetype';
  const link = document.createElement('a');
  link.href = currentThumbnailDataUrl;
  link.download = `${safeId}.jpg`;
  link.click();
  showToast(`Thumbnail saved as ${safeId}.jpg`, 'success');
}
