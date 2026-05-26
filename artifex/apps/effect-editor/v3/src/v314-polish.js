import {
  editorState,
  getActiveLayer,
  onStateChange,
  setReferenceMedia,
  setZoom,
  updateActiveLayer
} from './editor-state.js';

const OVERLAY_API_URL = 'https://api.github.com/repos/cinaedvsstudios/Forever-Bound-Game/contents/artifex/apps/effect-editor/overlays?ref=main';
const OVERLAY_EXT = /\.(png|webp|jpe?g)$/iu;
let overlays = [];
let overlayLoaded = false;
let patchedFillText = false;

const CARD_JUMPS = [
  ['🧩', 'Effect Archetype Assets', 'Asset setup'],
  ['🎨', 'Quick Edit Helpers', 'Quick helpers'],
  ['✨', 'Effect Layer Appearance', 'Appearance'],
  ['🎯', 'Effect Layer Dynamics', 'Dynamics'],
  ['🔷', 'Effect Specific Controls', 'Specific controls']
];

export function initV314Polish(showToast = () => {}) {
  injectStyles();
  patchCanvasMultilineText();
  installCardJumpIcons();
  combineBottomDisplayPanel();
  renameResetAppearance();
  installRangeSteppers();
  enhanceTextControls(showToast);
  loadLensFlareOverlays(showToast);
  onStateChange(() => {
    installCardJumpIcons();
    combineBottomDisplayPanel();
    renameResetAppearance();
    installRangeSteppers();
    enhanceTextControls(showToast);
    installOverlaySelector(showToast);
  });
}

function injectStyles() {
  if (document.getElementById('v314-polish-style')) return;
  const style = document.createElement('style');
  style.id = 'v314-polish-style';
  style.textContent = `
    .left-card-jumpbar { display:flex; align-items:center; gap:7px; margin-right:12px; }
    .left-card-jumpbar button { min-width:34px; min-height:34px; padding:5px 7px; border-radius:12px; text-align:center; font-size:15px; }
    .left-card-jumpbar button:hover { border-color:var(--module-accent); box-shadow:0 0 12px var(--module-glow); }
    #left-panel .card h2 .card-heading-emoji { margin-right:7px; letter-spacing:0; }
    .bottom-tool-card.v314-combined-display { min-width: 360px; }
    .bottom-tool-card.v314-combined-display .bottom-control-buttons { display:grid !important; grid-template-columns:repeat(4, minmax(42px, auto)); gap:8px; align-items:center; justify-content:start; }
    .bottom-tool-card.v314-combined-display .bottom-control-buttons .v314-break { display:none; }
    .bottom-tool-card.v314-combined-display .v314-row-2 { grid-column:1 / -1; display:grid; grid-template-columns:repeat(5, minmax(42px, auto)); gap:8px; align-items:center; }
    .bottom-tool-card.v314-combined-display button, .bottom-tool-card.v314-combined-display .reference-file-label { min-width:42px; min-height:38px; padding:7px 10px; text-align:center; }
    .v314-hidden-card { display:none !important; }
    .v314-underlay-scale { display:flex; align-items:center; gap:7px; min-width:118px; padding:4px 7px; border:1px solid var(--border); border-radius:12px; background:rgba(0,0,0,.22); }
    .v314-underlay-scale span { color:var(--gold-muted); font-size:10px; letter-spacing:.08em; text-transform:uppercase; }
    .v314-underlay-scale input { width:72px; }
    .value-stepper-v314 { display:inline-flex; gap:4px; margin-left:6px; vertical-align:middle; }
    .value-stepper-v314 button { min-width:22px !important; min-height:22px !important; padding:1px 5px !important; border-radius:7px !important; font-size:11px !important; }
    .v314-textarea { min-height:86px; resize:vertical; line-height:1.35; }
    .v314-text-tools { display:grid; grid-template-columns:1fr 1fr; gap:8px; grid-column:1 / -1; }
    .v314-text-tools button { min-height:34px; }
    .v314-overlay-row { grid-column:1 / -1; display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    .v314-overlay-row select { font-size:10px !important; }
    @media (max-width: 900px) {
      .left-card-jumpbar { display:none; }
      .bottom-tool-card.v314-combined-display .bottom-control-buttons { grid-template-columns:repeat(3, minmax(42px, auto)); }
    }
  `;
  document.head.append(style);
}

function installCardJumpIcons() {
  const menuBar = document.querySelector('.menu-bar');
  if (!menuBar || document.getElementById('left-card-jumpbar')) return;
  const jumpbar = document.createElement('div');
  jumpbar.id = 'left-card-jumpbar';
  jumpbar.className = 'left-card-jumpbar';
  for (const [emoji, title, tooltip] of CARD_JUMPS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = emoji;
    button.title = `${tooltip}: jump to ${title}.`;
    button.addEventListener('click', () => jumpToCard(title));
    jumpbar.append(button);
  }
  menuBar.prepend(jumpbar);
  decorateCardHeadings();
}

function decorateCardHeadings() {
  for (const [emoji, title] of CARD_JUMPS) {
    const card = findCard(title);
    const h2 = card?.querySelector('h2');
    if (!h2 || h2.querySelector('.card-heading-emoji')) continue;
    h2.insertAdjacentHTML('afterbegin', `<span class="card-heading-emoji">${emoji}</span>`);
  }
}

function jumpToCard(title) {
  const card = findCard(title);
  if (!card) return;
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  card.classList.add('is-cyan-selected');
  setTimeout(() => card.classList.remove('is-cyan-selected'), 900);
}

function findCard(title) {
  const normalized = normalizeTitle(title);
  return Array.from(document.querySelectorAll('#left-panel .card')).find((card) => normalizeTitle(card.querySelector('h2')?.textContent || '').includes(normalized));
}

function normalizeTitle(value) {
  return String(value).replace(/[🧩🎨✨🎯🔷]/gu, '').trim().toLowerCase();
}

function combineBottomDisplayPanel() {
  const cards = Array.from(document.querySelectorAll('.bottom-tool-card'));
  const displayCard = cards.find((card) => /Display|Playback/i.test(card.querySelector('h2')?.textContent || ''));
  const viewCard = cards.find((card) => /View\s*\/\s*Guides/i.test(card.querySelector('h2')?.textContent || ''));
  const displayButtons = displayCard?.querySelector('.bottom-control-buttons');
  if (!displayCard || !displayButtons) return;
  displayCard.classList.add('v314-combined-display');
  const title = displayCard.querySelector('h2');
  if (title) title.textContent = 'Display';

  const saveButton = document.getElementById('save-archetype-bottom-button');
  if (saveButton) saveButton.textContent = '💾';

  const viewButtons = viewCard?.querySelector('.bottom-control-buttons');
  if (viewButtons && !document.getElementById('v314-display-row-two')) {
    const rowTwo = document.createElement('div');
    rowTwo.id = 'v314-display-row-two';
    rowTwo.className = 'v314-row-2';
    const wanted = ['clear-particles-button-bottom', 'low-performance-button-playback', 'save-archetype-bottom-button', 'workspace-mode-cycle-button', 'helper-cycle-button'];
    for (const id of wanted) {
      const element = document.getElementById(id);
      if (element) rowTwo.append(element);
    }
    const underlay = document.querySelector('.reference-file-label');
    if (underlay) rowTwo.append(underlay);
    if (!document.getElementById('underlay-scale-control-v314')) {
      rowTwo.insertAdjacentHTML('beforeend', `<label id="underlay-scale-control-v314" class="v314-underlay-scale" title="Scale the loaded underlay image/video."><span>Size</span><input id="reference-scale-input" type="range" min="0.25" max="2" step="0.05" value="1" /></label>`);
      document.getElementById('reference-scale-input')?.addEventListener('input', (event) => {
        editorState.referenceMedia = editorState.referenceMedia || {};
        editorState.referenceMedia.scale = Number(event.target.value) || 1;
        setReferenceMedia(editorState.referenceMedia);
      });
    }
    displayButtons.append(rowTwo);
    viewCard?.classList.add('v314-hidden-card');
  }

  const firstRowOrder = ['pause-button', 'zoom-out-button', 'zoom-readout', 'zoom-in-button', 'undo-bottom-button-v312', 'redo-bottom-button-v312', 'helper-cycle-button'];
  for (const id of firstRowOrder) {
    const el = document.getElementById(id);
    if (el && id !== 'helper-cycle-button' && el.parentElement !== displayButtons) displayButtons.append(el);
  }

  const zoomOut = document.getElementById('zoom-out-button');
  const zoomIn = document.getElementById('zoom-in-button');
  if (zoomOut) zoomOut.title = 'Zoom out.';
  if (zoomIn) zoomIn.title = 'Zoom in.';
}

function renameResetAppearance() {
  const button = document.getElementById('reset-appearance-button');
  if (button) button.textContent = 'Reset';
}

function installRangeSteppers() {
  document.querySelectorAll('#left-panel label, #effect-specific-controls-card label').forEach((label) => {
    const input = label.querySelector('input[type="range"]');
    const output = label.querySelector('output');
    if (!input || !output || label.querySelector('.value-stepper-v314')) return;
    output.insertAdjacentHTML('afterend', `<span class="value-stepper-v314"><button type="button" data-step="down" title="Decrease by one step.">&lt;</button><button type="button" data-step="up" title="Increase by one step.">&gt;</button></span>`);
    label.querySelector('[data-step="down"]')?.addEventListener('click', () => nudgeRange(input, -1));
    label.querySelector('[data-step="up"]')?.addEventListener('click', () => nudgeRange(input, 1));
  });
}

function nudgeRange(input, direction) {
  const step = Number(input.step) || 1;
  const min = Number.isFinite(Number(input.min)) ? Number(input.min) : -Infinity;
  const max = Number.isFinite(Number(input.max)) ? Number(input.max) : Infinity;
  const current = Number(input.value) || 0;
  input.value = String(Math.min(max, Math.max(min, current + step * direction)));
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function enhanceTextControls(showToast) {
  const layer = getActiveLayer();
  if (!layer || !((layer.appearanceMode === 'shape' && layer.particleShape === 'text') || layer.engine === 'text')) return;
  const textInput = document.querySelector('[data-effect-field="textContent"]');
  if (textInput && textInput.tagName !== 'TEXTAREA') {
    const textarea = document.createElement('textarea');
    textarea.className = 'v314-textarea';
    textarea.dataset.effectField = 'textContent';
    textarea.value = layer.textContent || '';
    textarea.title = 'Type one or more lines of effect text.';
    textarea.addEventListener('input', () => updateActiveLayer({ textContent: textarea.value }));
    textInput.replaceWith(textarea);
  }
  const grid = document.getElementById('effect-specific-grid');
  if (grid && !document.getElementById('text-tools-v314')) {
    const tools = document.createElement('div');
    tools.id = 'text-tools-v314';
    tools.className = 'v314-text-tools';
    tools.innerHTML = `<button id="text-all-caps-button" type="button" title="Convert the active text to ALL CAPS.">ALL CAPS</button><label>Line Spacing<input id="text-line-spacing-input" type="range" min="0.8" max="2.4" step="0.05" value="${Number(layer.textLineSpacing || 1.2)}" /><output>${Number(layer.textLineSpacing || 1.2)}</output></label>`;
    grid.append(tools);
    document.getElementById('text-all-caps-button')?.addEventListener('click', () => {
      const next = String(getActiveLayer()?.textContent || '').toUpperCase();
      updateActiveLayer({ textContent: next });
      showToast('Text converted to ALL CAPS.', 'success');
    });
    document.getElementById('text-line-spacing-input')?.addEventListener('input', (event) => {
      const value = Number(event.target.value) || 1.2;
      event.target.parentElement.querySelector('output').textContent = value.toFixed(2).replace(/0+$/u, '').replace(/\.$/u, '');
      updateActiveLayer({ textLineSpacing: value });
    });
  }
}

function patchCanvasMultilineText() {
  if (patchedFillText) return;
  patchedFillText = true;
  const originalFillText = CanvasRenderingContext2D.prototype.fillText;
  const originalStrokeText = CanvasRenderingContext2D.prototype.strokeText;
  CanvasRenderingContext2D.prototype.fillText = function patchedFillText(text, x, y, maxWidth) {
    const string = String(text ?? '');
    if (!string.includes('\n')) return originalFillText.call(this, text, x, y, maxWidth);
    drawMultilineText(this, originalFillText, string, x, y, maxWidth);
  };
  CanvasRenderingContext2D.prototype.strokeText = function patchedStrokeText(text, x, y, maxWidth) {
    const string = String(text ?? '');
    if (!string.includes('\n')) return originalStrokeText.call(this, text, x, y, maxWidth);
    drawMultilineText(this, originalStrokeText, string, x, y, maxWidth);
  };
}

function drawMultilineText(ctx, fn, text, x, y, maxWidth) {
  const lines = text.split(/\r?\n/u);
  const fontSize = Number((ctx.font.match(/(\d+(?:\.\d+)?)px/u) || [])[1]) || 16;
  const lineHeight = fontSize * 1.2;
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => fn.call(ctx, line, x, startY + index * lineHeight, maxWidth));
}

async function loadLensFlareOverlays(showToast) {
  if (overlayLoaded) return;
  overlayLoaded = true;
  try {
    const response = await fetch(OVERLAY_API_URL, { cache: 'no-store' });
    if (!response.ok) return;
    const entries = await response.json();
    overlays = Array.isArray(entries) ? entries.filter((entry) => entry.type === 'file' && OVERLAY_EXT.test(entry.name || '')) : [];
    if (!overlays.length) return;
    const first = overlays[0];
    const dataUrl = await fetchOverlayDataUrl(first.download_url);
    if (dataUrl) {
      first.dataUrl = dataUrl;
      globalThis.ArtifexLensFlareOverlayDataUrl = dataUrl;
      showToast(`${overlays.length} lens flare overlay${overlays.length === 1 ? '' : 's'} found.`, 'success');
    }
    installOverlaySelector(showToast);
  } catch (error) {
    console.warn('Lens flare overlay loading failed', error);
  }
}

async function fetchOverlayDataUrl(url) {
  if (!url) return '';
  const response = await fetch(url, { cache: 'force-cache' });
  if (!response.ok) return '';
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result || '')));
    reader.addEventListener('error', reject);
    reader.readAsDataURL(blob);
  });
}

function installOverlaySelector(showToast) {
  const layer = getActiveLayer();
  const grid = document.getElementById('effect-specific-grid');
  if (!grid || layer?.engine !== 'true-lensflare' || !overlays.length || document.getElementById('flare-overlay-select-v314')) return;
  const row = document.createElement('div');
  row.className = 'v314-overlay-row';
  row.innerHTML = `<label>Overlay<select id="flare-overlay-select-v314"><option value="">Auto / first overlay</option>${overlays.map((item, index) => `<option value="${index}">${escapeHtml(item.name)}</option>`).join('')}</select></label><label>Overlay Blend<select id="flare-overlay-blend-v314"><option value="screen">Screen</option><option value="lighter">Add</option><option value="source-over">Normal</option></select></label>`;
  grid.append(row);
  document.getElementById('flare-overlay-select-v314')?.addEventListener('change', async (event) => {
    const overlay = overlays[Number(event.target.value)] || overlays[0];
    if (!overlay.dataUrl) overlay.dataUrl = await fetchOverlayDataUrl(overlay.download_url);
    globalThis.ArtifexLensFlareOverlayDataUrl = overlay.dataUrl || '';
    updateActiveLayer({ flareOverlayDataUrl: overlay.dataUrl || '', flareOverlayUrl: overlay.download_url || '', flareOverlayName: overlay.name || '' });
    showToast(`Lens flare overlay: ${overlay.name}.`, 'success');
  });
  document.getElementById('flare-overlay-blend-v314')?.addEventListener('change', (event) => updateActiveLayer({ flareOverlayBlend: event.target.value }));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}
