import {
  deleteActiveLayer,
  duplicateActiveLayer,
  editorState,
  getActiveLayer,
  moveLayer,
  onStateChange,
  selectLayer,
  toggleLayerVisibility,
  updateActiveLayer
} from './editor-state.js';
import { resizeCanvas } from './editor-renderer.js';

const LAYOUT_STORAGE_KEY = 'artifex-index2-ui-layout';
const COLLAPSE_STORAGE_KEY = 'artifex-index2-card-collapse';
let lastPausedState = null;
let notify = () => {};

export function initEditorWorkspaceUI({ versionLabel, showToast } = {}) {
  notify = typeof showToast === 'function' ? showToast : () => {};
  setVersionLabel(versionLabel);
  restoreSavedLayout();
  setupPanelResizers();
  setupTopShortcuts();
  setupCardCollapse();
  simplifyBottomPanel();
  setupEffectTags();
  restoreQuickEditHelpers();
  addControlTooltips();
  onStateChange(syncWorkspaceUI);
  syncWorkspaceUI();
  window.setTimeout(() => {
    setupNumericSteppers();
    setupHexColourEntry();
    syncWorkspaceUI();
  }, 0);
}

function setVersionLabel(versionLabel) {
  if (!versionLabel) return;
  document.title = `Artifex Effect Editor ${versionLabel}`;
  const badge = document.getElementById('version-badge');
  if (badge) badge.textContent = versionLabel;
  const about = document.getElementById('about-button');
  if (about) about.textContent = `About ${versionLabel}`;
}

function setupTopShortcuts() {
  document.querySelectorAll('.index2-action-strip [data-jump-card]').forEach((button) => {
    button.addEventListener('click', () => jumpToCard(button.dataset.jumpCard));
  });
}

function jumpToCard(id) {
  const target = document.getElementById(id || '');
  if (!target) return;
  const query = document.getElementById('left-panel-search-input');
  if (target.classList.contains('index2-card-hidden') && query) {
    query.value = '';
    query.dispatchEvent(new Event('input', { bubbles: true }));
  }
  if (target.classList.contains('index2-card-collapsed')) {
    setCardCollapsed(target, false);
    persistCollapsedCards();
  }
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  target.classList.add('index2-jump-highlight');
  window.setTimeout(() => target.classList.remove('index2-jump-highlight'), 650);
}

function setupCardCollapse() {
  const saved = readCollapsedCards();
  document.querySelectorAll('#left-panel .card[id]').forEach((card) => {
    const button = card.querySelector('[data-card-collapse]');
    if (!button || button.dataset.workspaceBound === 'true') return;
    button.dataset.workspaceBound = 'true';
    setCardCollapsed(card, saved.includes(card.id));
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      setCardCollapsed(card, !card.classList.contains('index2-card-collapsed'));
      persistCollapsedCards();
    });
  });
}

function setCardCollapsed(card, collapsed) {
  card.classList.toggle('index2-card-collapsed', collapsed);
  const button = card.querySelector('[data-card-collapse]');
  if (!button) return;
  button.textContent = collapsed ? '⬇️' : '⬆️';
  button.title = `${collapsed ? 'Expand' : 'Collapse'} ${card.querySelector('h2')?.textContent || 'panel'}`;
}

function readCollapsedCards() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(COLLAPSE_STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function persistCollapsedCards() {
  const ids = Array.from(document.querySelectorAll('#left-panel .card.index2-card-collapsed[id]')).map((card) => card.id);
  try {
    window.localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage restrictions.
  }
}

function simplifyBottomPanel() {
  const cards = document.querySelectorAll('#bottom-panel .index2-bottom-card');
  if (cards.length < 3) return;
  cards[0].classList.add('index2-layers-card');
  cards[1].classList.add('index2-display-card');
  cards[2].classList.add('index2-diagnostics-card');
  cards[0].querySelector('.index2-layer-toolbar')?.remove();
}

function syncWorkspaceUI() {
  syncCanvasButtonIcons();
  syncPreviewStatusPill();
  syncEffectTags();
  enhanceLayerList();
  setupNumericSteppers();
  setupHexColourEntry();
  syncHexColourEntry();
}

function syncCanvasButtonIcons() {
  const pause = document.getElementById('pause-button');
  const snapshot = document.getElementById('snapshot-button');
  if (pause) {
    if (editorState.isPaused) {
      pause.innerHTML = '<span class="index2-paused-icon" aria-hidden="true">▶️</span>';
      pause.title = 'Resume preview';
      if (lastPausedState === false) {
        pause.classList.remove('index2-paused-flash');
        void pause.offsetWidth;
        pause.classList.add('index2-paused-flash');
        window.setTimeout(() => pause.classList.remove('index2-paused-flash'), 720);
      }
    } else {
      pause.innerHTML = '<span class="index2-play-spinner" aria-hidden="true"></span>';
      pause.title = 'Pause preview';
      pause.classList.remove('index2-paused-flash');
    }
  }
  if (snapshot) {
    snapshot.textContent = '📸';
    snapshot.title = 'Take snapshot';
  }
  lastPausedState = editorState.isPaused;
}

function syncPreviewStatusPill() {
  const state = document.getElementById('index2-display-state');
  if (!state) return;
  state.textContent = editorState.isPaused ? 'PAUSED' : 'PLAYING';
  state.classList.toggle('index2-status-paused', editorState.isPaused);
  state.classList.toggle('index2-status-playing', !editorState.isPaused);
}

function enhanceLayerList() {
  const layers = editorState.composition.layers;
  const items = document.querySelectorAll('#layer-list .layer-item');
  if (!layers.length) return;
  items.forEach((item, index) => {
    if (item.querySelector('.layer-sequence-number')) return;
    const layer = layers[index];
    const number = document.createElement('span');
    number.className = 'layer-sequence-number';
    number.textContent = String(index + 1);
    number.title = `Sequence position ${index + 1}`;
    const actions = document.createElement('span');
    actions.className = 'layer-inline-actions';
    actions.append(
      layerAction('⬆️', `Move ${layer?.name || 'layer'} up`, index === 0, () => moveLayer(index, index - 1)),
      layerAction('⬇️', `Move ${layer?.name || 'layer'} down`, index === layers.length - 1, () => moveLayer(index, index + 1)),
      layerAction(layer?.visible === false ? '🙈' : '👁️', 'Toggle layer visibility', false, () => toggleLayerVisibility(index)),
      layerAction('⧉', 'Duplicate layer', false, () => { selectLayer(index); duplicateActiveLayer(); }),
      layerAction('×', 'Delete layer', false, () => { selectLayer(index); deleteActiveLayer(); })
    );
    item.prepend(number);
    item.append(actions);
  });
}

function layerAction(icon, title, disabled, action) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'layer-inline-action';
  button.textContent = icon;
  button.title = title;
  button.disabled = disabled;
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!button.disabled) action();
  });
  return button;
}

function setupEffectTags() {
  const card = document.getElementById('index2-card-assets');
  const layerName = document.getElementById('layer-name-input')?.closest('label');
  if (!card || !layerName || document.getElementById('effect-tags-input')) return;
  const field = document.createElement('label');
  field.className = 'index2-tags-field';
  field.innerHTML = 'Tags<input id="effect-tags-input" placeholder="magic, fire, projectile" />';
  layerName.before(field);
  field.querySelector('input')?.addEventListener('input', (event) => {
    editorState.composition.tags = normalizeTags(event.target.value);
  });
}

function syncEffectTags() {
  const input = document.getElementById('effect-tags-input');
  if (!input || document.activeElement === input) return;
  input.value = Array.isArray(editorState.composition.tags) ? editorState.composition.tags.join(', ') : '';
}

function normalizeTags(value) {
  return [...new Set(String(value || '').split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
}

function setupNumericSteppers() {
  document.querySelectorAll('#left-panel label input[type="range"], #left-panel label input[type="number"]').forEach((input) => {
    if (input.dataset.index2Stepper === 'true') return;
    input.dataset.index2Stepper = 'true';
    let output = input.parentElement?.querySelector('output');
    if (!output) {
      output = document.createElement('output');
      output.textContent = input.value;
    } else {
      output.remove();
    }
    const stepper = document.createElement('span');
    stepper.className = 'index2-value-stepper';
    stepper.append(
      stepButton('<', `Decrease ${labelText(input)}`, () => stepInput(input, -1, output)),
      output,
      stepButton('>', `Increase ${labelText(input)}`, () => stepInput(input, 1, output))
    );
    input.after(stepper);
    input.addEventListener('input', () => { output.textContent = formatInputValue(input.value); });
  });
}

function labelText(input) {
  return input.closest('label')?.childNodes[0]?.textContent?.trim() || 'value';
}

function stepButton(text, title, handler) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'index2-value-step';
  button.textContent = text;
  button.title = title;
  button.addEventListener('click', handler);
  return button;
}

function stepInput(input, direction, output) {
  if (direction < 0) input.stepDown();
  else input.stepUp();
  output.textContent = formatInputValue(input.value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function formatInputValue(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value || '');
  return Number.isInteger(number) ? String(number) : String(Number(number.toFixed(2)));
}

function setupHexColourEntry() {
  const nativeInput = document.getElementById('stop-color-input');
  if (!nativeInput || document.getElementById('stop-color-hex-input')) return;
  const hexInput = document.createElement('input');
  hexInput.id = 'stop-color-hex-input';
  hexInput.type = 'text';
  hexInput.placeholder = '#FF0000';
  hexInput.maxLength = 7;
  hexInput.autocomplete = 'off';
  hexInput.spellcheck = false;
  hexInput.addEventListener('input', () => applyHexColour(hexInput.value));
  nativeInput.before(hexInput);
}

function applyHexColour(raw) {
  const colour = normalizeHexInput(raw);
  if (!colour) return;
  const layer = getActiveLayer();
  if (!layer) return;
  const stops = Array.isArray(layer.appearanceStops) ? layer.appearanceStops.map((stop) => ({ ...stop })) : [];
  if (!stops.length) return;
  const index = Math.max(0, Math.min(stops.length - 1, Number(layer.activeAppearanceStopIndex) || 0));
  stops[index].color = colour;
  updateActiveLayer({ appearanceStops: stops, activeAppearanceStopIndex: index });
}

function normalizeHexInput(value) {
  const raw = String(value || '').trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(raw)) return `#${raw.split('').map((char) => char + char).join('').toLowerCase()}`;
  if (/^[0-9a-f]{6}$/i.test(raw)) return `#${raw.toLowerCase()}`;
  return '';
}

function syncHexColourEntry() {
  const input = document.getElementById('stop-color-hex-input');
  const layer = getActiveLayer();
  if (!input || !layer || document.activeElement === input) return;
  const stops = Array.isArray(layer.appearanceStops) ? layer.appearanceStops : [];
  const index = Math.max(0, Math.min(stops.length - 1, Number(layer.activeAppearanceStopIndex) || 0));
  if (stops[index]?.color) input.value = stops[index].color.toUpperCase();
}

function restoreQuickEditHelpers() {
  const card = document.getElementById('index2-card-presets');
  if (!card || card.querySelector('.index2-quick-helper-sections')) return;
  card.querySelector('.button-row')?.remove();
  card.insertAdjacentHTML('beforeend', `
    <div class="index2-quick-helper-sections">
      ${helperSection('Colour Helpers', 'colour', ['Fire', 'Ice', 'Good Magic', 'Dark Magic', 'Water', 'Evil'])}
      ${helperSection('Appearance Helpers', 'appearance', ['Soft Glow', 'Sharp Sparks', 'Fade In/Out', 'Bright Add', 'White Fog', 'Sooty Smoke'])}
      ${helperSection('Dynamics Helpers', 'dynamics', ['Slow Drift', 'Burst Out', 'Rise Up', 'Tight Trail'])}
    </div>
  `);
  card.querySelectorAll('[data-helper-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      const patch = HELPER_PRESETS[button.dataset.helperPreset];
      if (!patch) return;
      updateActiveLayer(patch);
      notify(`${button.textContent.trim()} helper applied.`, 'success');
    });
  });
}

function helperSection(title, group, labels) {
  return `<section class="index2-helper-section"><div class="index2-helper-title"><span></span>${title}</div><div class="index2-helper-grid">${labels.map((label) => `<button type="button" data-helper-preset="${group}:${slug(label)}">${label}</button>`).join('')}</div></section>`;
}

function slug(label) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

const HELPER_PRESETS = {
  'colour:fire': { appearanceStops: [{ position: 0, color: '#fff1a8', opacity: 1, size: 24, glow: 34 }, { position: 0.5, color: '#ff8a00', opacity: 0.8, size: 18, glow: 24 }, { position: 1, color: '#ff2600', opacity: 0, size: 5, glow: 0 }], gravity: 0.04, blendMode: 'lighter' },
  'colour:ice': { appearanceStops: [{ position: 0, color: '#ffffff', opacity: 0.95, size: 18, glow: 22 }, { position: 0.5, color: '#99f2ff', opacity: 0.7, size: 14, glow: 16 }, { position: 1, color: '#00a1d7', opacity: 0, size: 2, glow: 0 }], gravity: -0.01, blendMode: 'screen' },
  'colour:good-magic': { appearanceStops: [{ position: 0, color: '#fff7cf', opacity: 1, size: 18, glow: 30 }, { position: 0.5, color: '#d65cff', opacity: 0.85, size: 22, glow: 34 }, { position: 1, color: '#5e8cff', opacity: 0, size: 8, glow: 0 }], gravity: -0.008, blendMode: 'lighter' },
  'colour:dark-magic': { appearanceStops: [{ position: 0, color: '#b6ff2e', opacity: 0.95, size: 20, glow: 24 }, { position: 0.5, color: '#29e36c', opacity: 0.8, size: 24, glow: 20 }, { position: 1, color: '#061709', opacity: 0, size: 6, glow: 0 }], gravity: 0.015, blendMode: 'lighter' },
  'colour:water': { appearanceStops: [{ position: 0, color: '#dffbff', opacity: 0.9, size: 18, glow: 10 }, { position: 0.5, color: '#38b6ff', opacity: 0.75, size: 20, glow: 12 }, { position: 1, color: '#0356a6', opacity: 0, size: 5, glow: 0 }] },
  'colour:evil': { appearanceStops: [{ position: 0, color: '#ffb0b0', opacity: 0.95, size: 19, glow: 24 }, { position: 0.5, color: '#ff003c', opacity: 0.85, size: 24, glow: 22 }, { position: 1, color: '#130006', opacity: 0, size: 7, glow: 0 }], blendMode: 'lighter' },
  'appearance:soft-glow': { glow: 24, edgeBlur: 1.2, blendMode: 'screen', textureContrast: 0.9 },
  'appearance:sharp-sparks': { appearanceMode: 'brush', builtInBrush: 'slash', glow: 10, edgeBlur: 0, sizeStart: 10, sizeEnd: 1, textureContrast: 1.45 },
  'appearance:fade-in-out': { appearanceStops: [{ position: 0, color: '#ffcc66', opacity: 0, size: 4, glow: 0 }, { position: 0.5, color: '#fff1a8', opacity: 1, size: 18, glow: 18 }, { position: 1, color: '#ff6600', opacity: 0, size: 4, glow: 0 }] },
  'appearance:bright-add': { blendMode: 'lighter', glow: 30, textureAlpha: 1, textureContrast: 1.25 },
  'appearance:white-fog': { colorA: '#ffffff', colorB: '#d9e6ea', alphaStart: 0.45, alphaEnd: 0, sizeStart: 38, sizeEnd: 64, edgeBlur: 1.6, blendMode: 'screen' },
  'appearance:sooty-smoke': { colorA: '#696360', colorB: '#161413', alphaStart: 0.6, alphaEnd: 0, sizeStart: 28, sizeEnd: 54, edgeBlur: 1.4, textureContrast: 0.8 },
  'dynamics:slow-drift': { spawnRate: 6, speedMin: 0.35, speedMax: 1.4, gravity: -0.004, spread: 110, lifetime: 155 },
  'dynamics:burst-out': { spawnRate: 36, speedMin: 6, speedMax: 14, gravity: 0, spread: 360, lifetime: 46 },
  'dynamics:rise-up': { spawnRate: 14, speedMin: 1.6, speedMax: 5.5, angle: -90, gravity: -0.03, spread: 42, lifetime: 96 },
  'dynamics:tight-trail': { spawnRate: 22, speedMin: 2, speedMax: 4.4, spread: 10, lifetime: 72 }
};

function setupPanelResizers() {
  const leftPanel = document.getElementById('left-panel');
  const sideResizer = document.getElementById('side-resizer');
  const bottomPanel = document.getElementById('bottom-panel');
  const bottomResizer = document.getElementById('bottom-resizer');
  if (!leftPanel || !sideResizer || !bottomPanel || !bottomResizer) return;

  setupPointerResize(sideResizer, 'side', (event, start) => {
    leftPanel.style.width = `${Math.round(clamp(start.size + event.clientX - start.pointer, 245, 560))}px`;
    requestCanvasResize();
  });
  setupPointerResize(bottomResizer, 'bottom', (event, start) => {
    bottomPanel.style.height = `${Math.round(clamp(start.size - (event.clientY - start.pointer), 105, 420))}px`;
    requestCanvasResize();
  });
  sideResizer.addEventListener('dblclick', () => { leftPanel.style.width = '330px'; persistLayout(); requestCanvasResize(); });
  bottomResizer.addEventListener('dblclick', () => { bottomPanel.style.height = '170px'; persistLayout(); requestCanvasResize(); });
}

function setupPointerResize(handle, kind, onMove) {
  handle.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const panel = kind === 'side' ? document.getElementById('left-panel') : document.getElementById('bottom-panel');
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    const start = { pointer: kind === 'side' ? event.clientX : event.clientY, size: kind === 'side' ? rect.width : rect.height };
    const bodyClass = kind === 'side' ? 'index2-resizing-side' : 'index2-resizing-bottom';
    document.body.classList.add('index2-resizing', bodyClass);
    handle.setPointerCapture(event.pointerId);
    const move = (moveEvent) => onMove(moveEvent, start);
    const finish = () => {
      document.body.classList.remove('index2-resizing', bodyClass);
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', finish);
      handle.removeEventListener('pointercancel', finish);
      persistLayout();
      requestCanvasResize();
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', finish);
    handle.addEventListener('pointercancel', finish);
  });
}

function persistLayout() {
  const leftWidth = document.getElementById('left-panel')?.style.width || '';
  const bottomHeight = document.getElementById('bottom-panel')?.style.height || '';
  try {
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify({ leftWidth, bottomHeight }));
  } catch {
    // Ignore storage restrictions.
  }
}

function restoreSavedLayout() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(LAYOUT_STORAGE_KEY) || '{}');
    const leftPanel = document.getElementById('left-panel');
    const bottomPanel = document.getElementById('bottom-panel');
    if (leftPanel && saved.leftWidth) leftPanel.style.width = saved.leftWidth;
    if (bottomPanel && saved.bottomHeight) bottomPanel.style.height = saved.bottomHeight;
    requestCanvasResize();
  } catch {
    try { window.localStorage.removeItem(LAYOUT_STORAGE_KEY); } catch { /* no-op */ }
  }
}

let resizeFrame = 0;
function requestCanvasResize() {
  window.cancelAnimationFrame(resizeFrame);
  resizeFrame = window.requestAnimationFrame(() => resizeCanvas());
}

function addControlTooltips() {
  const tips = {
    'pause-button': 'Pause or resume the preview.',
    'snapshot-button': 'Export a PNG snapshot.',
    'zoom-out-button': 'Zoom out.',
    'zoom-in-button': 'Zoom in.',
    'zoom-reset-button': 'Reset zoom.'
  };
  Object.entries(tips).forEach(([id, title]) => {
    const element = document.getElementById(id);
    if (element) element.title = title;
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
