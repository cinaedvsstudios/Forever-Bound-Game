import { editorState, getActiveLayer, onStateChange, updateActiveLayer } from './editor-state.js';

const MODULE_LINKS = [
  ['🏠', 'Hub', '../../index.html'],
  ['🧭', 'Creation Guide', '../creation-guide/index.html'],
  ['🗂️', 'Project Manager', '../project-manager/index.html'],
  ['🖼️', 'Scene Editor', '../scene-editor/index.html'],
  ['📜', 'Quest Builder', '../quest-builder/index.html'],
  ['🧩', 'Puzzle Creator', '../puzzle-creator/index.html'],
  ['✨', 'Effect Editor', '../effect-editor/index.html'],
  ['🧱', 'Archetype Object Creator', '../archetype-object-creator/index.html']
];

const INSERT_ICON_BY_LABEL = new Map([
  ['Standard Particle', '✨'],
  ['Electric Arc', '⚡'],
  ['Projectile Core', '🔥'],
  ['Magic Trail / Ribbon', '🌀'],
  ['Shockwave Pulse', '💫'],
  ['Radial Burst', '💥'],
  ['Soft Smoke / Gas Base', '💨'],
  ['Shimmer Wisps', '➿'],
  ['Heat Distortion / Underlay Warp', '♨️'],
  ['Optic Glint', '⚝'],
  ['True Lens Flare', '🔅'],
  ['Rising Spell Text', '🔤']
]);

let dragFixBound = false;
let moduleFlyoutBound = false;

export function initV317Polish(showToast = () => {}) {
  injectStyles();
  installModuleMenu();
  repairDisplayGrid();
  updateInsertIcons();
  installAppearanceMarkerDragFix();
  installTextSpecificHelpers();
  syncTextLayerUI();
  onStateChange(() => {
    installModuleMenu();
    repairDisplayGrid();
    updateInsertIcons();
    installAppearanceMarkerDragFix();
    installTextSpecificHelpers();
    syncTextLayerUI();
  });
}

function injectStyles() {
  if (document.getElementById('v317-polish-style')) return;
  const style = document.createElement('style');
  style.id = 'v317-polish-style';
  style.textContent = `
    .module-switcher-section-v317 { position: relative; border-bottom: 1px solid rgba(226,204,167,.14); margin-bottom: 9px; padding-bottom: 9px; }
    .module-switcher-button-v317 { width: 100%; display: flex !important; justify-content: space-between !important; align-items: center !important; gap: 10px; min-height: 38px !important; }
    .module-switcher-button-v317 span:first-child { display: inline-flex; align-items: center; gap: 8px; }
    .module-switcher-flyout-v317 { position: absolute; top: 0; left: calc(100% + 8px); z-index: 60; min-width: 250px; display: none; padding: 10px; border: 1px solid var(--border); border-radius: 16px; background: rgba(18, 12, 10, .98); box-shadow: 0 18px 34px rgba(0,0,0,.58), 0 0 18px rgba(0,174,234,.12); }
    .module-switcher-section-v317:hover .module-switcher-flyout-v317,
    .module-switcher-section-v317.is-open .module-switcher-flyout-v317 { display: grid; gap: 7px; }
    .module-switcher-flyout-v317 h3 { margin: 0 0 4px; color: var(--gold-muted); font-size: 10px; letter-spacing: .18em; text-transform: uppercase; }
    .module-switcher-flyout-v317 a { display: flex; align-items: center; gap: 8px; min-height: 34px; padding: 7px 9px; border: 1px solid var(--border); border-radius: 12px; color: var(--gold); background: linear-gradient(180deg, #2a201a 0%, #1b1411 100%); text-decoration: none; font-size: 11px; }
    .module-switcher-flyout-v317 a:hover { border-color: var(--module-accent); box-shadow: 0 0 12px var(--module-glow); color: white; }

    .bottom-panel-grid.v315-display-grid { grid-template-columns: minmax(250px, 1.35fr) minmax(168px, 168px) minmax(250px, .95fr) !important; gap: 12px !important; }
    .v315-display-grid .bottom-tool-card.v314-combined-display { min-width: 0 !important; width: 168px !important; max-width: 168px !important; overflow: hidden !important; }
    .v315-display-grid .bottom-tool-card.v314-combined-display .bottom-control-buttons {
      display: grid !important;
      grid-template-columns: repeat(3, 44px) !important;
      grid-auto-rows: 40px !important;
      gap: 7px !important;
      justify-content: start !important;
      align-items: stretch !important;
      overflow: visible !important;
    }
    .v315-display-grid .bottom-tool-card.v314-combined-display .bottom-control-buttons > button,
    .v315-display-grid .bottom-tool-card.v314-combined-display .bottom-control-buttons > .reference-file-label,
    .v315-display-grid .bottom-tool-card.v314-combined-display .bottom-control-buttons > span {
      width: 44px !important;
      min-width: 44px !important;
      height: 40px !important;
      min-height: 40px !important;
      padding: 5px !important;
      border-radius: 13px !important;
      display: grid !important;
      place-items: center !important;
      overflow: hidden !important;
      white-space: nowrap !important;
      font-size: 14px !important;
      line-height: 1 !important;
    }
    .v315-display-grid .bottom-tool-card.v314-combined-display .v314-row-2 { display: contents !important; }
    .v315-display-grid .v314-underlay-scale {
      grid-column: 1 / -1 !important;
      width: 148px !important;
      min-width: 148px !important;
      height: 38px !important;
      display: grid !important;
      grid-template-columns: auto 1fr !important;
      gap: 6px !important;
      padding: 4px 7px !important;
      align-items: center !important;
    }
    .v315-display-grid .v314-underlay-scale span { font-size: 9px !important; }
    .v315-display-grid .v314-underlay-scale input { width: 88px !important; }
    #helper-cycle-button { font-size: 0 !important; }
    #helper-cycle-button::before { content: '🧭'; font-size: 16px; }
    #reset-appearance-button { min-height: 36px !important; height: 36px !important; max-height: 36px !important; padding: 5px 10px !important; font-size: 11px !important; align-self: end !important; }
    body.text-layer-active-v317 #spawn-rate-input { opacity: .35; filter: grayscale(.8); }
    body.text-layer-active-v317 #spawn-rate-input ~ output,
    body.text-layer-active-v317 #spawn-rate-input + output { opacity: .45; }
    body.text-layer-active-v317 #spawn-rate-input::after { content: ''; }
    .text-helper-fields-v317 { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 9px; border: 1px solid rgba(0,174,234,.28); border-radius: 14px; background: rgba(0,174,234,.06); }
    .text-helper-fields-v317 label { margin: 0; }
  `;
  document.head.append(style);
}

function installModuleMenu() {
  const menuFile = document.getElementById('menu-file');
  if (!menuFile || document.getElementById('module-switcher-section-v317')) return;
  const section = document.createElement('section');
  section.id = 'module-switcher-section-v317';
  section.className = 'module-switcher-section-v317';
  section.innerHTML = `
    <button id="module-switcher-button-v317" class="module-switcher-button-v317" type="button" title="Open the core Artifex module switcher."><span>🧭 Module</span><span>▸</span></button>
    <div id="module-switcher-flyout-v317" class="module-switcher-flyout-v317" role="menu">
      <h3>Core Modules</h3>
      ${MODULE_LINKS.map(([icon, label, href]) => `<a href="${href}" role="menuitem" title="Open ${escapeHtml(label)}"><span>${icon}</span><span>${escapeHtml(label)}</span></a>`).join('')}
    </div>
  `;
  menuFile.prepend(section);
  bindModuleFlyout();
}

function bindModuleFlyout() {
  if (moduleFlyoutBound) return;
  moduleFlyoutBound = true;
  document.addEventListener('click', (event) => {
    const section = document.getElementById('module-switcher-section-v317');
    if (!section) return;
    const button = event.target.closest?.('#module-switcher-button-v317');
    if (button) {
      event.preventDefault();
      section.classList.toggle('is-open');
      return;
    }
    if (!section.contains(event.target)) section.classList.remove('is-open');
  });
}

function repairDisplayGrid() {
  const displayCard = Array.from(document.querySelectorAll('.bottom-tool-card')).find((card) => /Display|Playback/i.test(card.querySelector('h2')?.textContent || ''));
  const buttons = displayCard?.querySelector('.bottom-control-buttons');
  if (!displayCard || !buttons) return;
  displayCard.querySelector('h2').textContent = 'Display';
  const rowTwo = document.getElementById('v314-display-row-two');
  if (rowTwo && rowTwo.parentElement !== buttons) buttons.append(rowTwo);

  const ordered = [
    'undo-bottom-button-v312',
    'redo-bottom-button-v312',
    'helper-cycle-button',
    'low-performance-button-playback',
    'save-archetype-bottom-button',
    'workspace-mode-cycle-button',
    'clear-particles-button-bottom',
    'toggle-reference-button'
  ];
  ordered.forEach((id) => moveInto(buttons, id));
  const reference = document.querySelector('.reference-file-label');
  if (reference && reference.parentElement !== buttons) buttons.append(reference);
  const size = document.getElementById('underlay-scale-control-v314');
  if (size && size.parentElement !== buttons) buttons.append(size);

  setButton('save-archetype-bottom-button', '💾', 'Save archetype.');
  setButton('clear-particles-button-bottom', '🧹', 'Clear particles.');
  setButton('workspace-mode-cycle-button', 'BG', 'Cycle background.');
  setButton('toggle-reference-button', '🖼️', 'Show or hide underlay.');
  setButton('low-performance-button-playback', '🐢', 'Toggle low performance mode.');

  if (reference) {
    const input = reference.querySelector('input');
    reference.textContent = '';
    const icon = document.createElement('span');
    icon.textContent = '📁';
    reference.append(icon);
    if (input) reference.append(input);
    reference.title = 'Load image/video underlay.';
  }
}

function moveInto(host, id) {
  const element = document.getElementById(id);
  if (element && element.parentElement !== host) host.append(element);
}

function setButton(id, text, title) {
  const button = document.getElementById(id);
  if (!button) return;
  button.textContent = text;
  button.title = title;
}

function updateInsertIcons() {
  const list = document.getElementById('base-layer-list');
  if (!list) return;
  Array.from(list.querySelectorAll('button')).forEach((button) => {
    const label = button.querySelector('.insert-label-v315')?.textContent?.trim() || button.textContent.trim();
    const icon = INSERT_ICON_BY_LABEL.get(label);
    const iconBox = button.querySelector('.insert-icon-box-v315');
    if (icon && iconBox) iconBox.textContent = icon;
  });
}

function installAppearanceMarkerDragFix() {
  const track = document.getElementById('appearance-stop-track');
  if (!track || dragFixBound) return;
  dragFixBound = true;
  track.addEventListener('pointerdown', (event) => {
    const marker = event.target.closest?.('.appearance-stop-marker');
    if (!marker) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const layer = getActiveLayer();
    if (!layer) return;
    const markers = Array.from(track.querySelectorAll('.appearance-stop-marker'));
    const index = markers.indexOf(marker);
    const stopId = getStops(layer)[index]?.id;
    if (!stopId) return;
    const pointerId = event.pointerId;
    marker.setPointerCapture?.(pointerId);
    const move = (moveEvent) => moveMarkerToEvent(moveEvent, stopId);
    const up = () => {
      window.removeEventListener('pointermove', move, true);
      window.removeEventListener('pointerup', up, true);
      window.removeEventListener('pointercancel', up, true);
    };
    window.addEventListener('pointermove', move, true);
    window.addEventListener('pointerup', up, true);
    window.addEventListener('pointercancel', up, true);
    move(event);
  }, true);
}

function moveMarkerToEvent(event, stopId) {
  const layer = getActiveLayer();
  const track = document.getElementById('appearance-stop-track');
  if (!layer || !track) return;
  const rect = track.getBoundingClientRect();
  const raw = (event.clientX - rect.left) / Math.max(1, rect.width);
  const snapped = Math.round(Math.min(1, Math.max(0, raw)) * 10) / 10;
  const stops = getStops(layer);
  const nextStops = stops.map((stop) => stop.id === stopId ? { ...stop, position: snapped } : { ...stop });
  const selectedIndex = nextStops.findIndex((stop) => stop.id === stopId);
  updateActiveLayer({ appearanceStops: nextStops, activeAppearanceStopIndex: Math.max(0, selectedIndex) });
}

function getStops(layer) {
  const raw = Array.isArray(layer.appearanceStops) && layer.appearanceStops.length ? layer.appearanceStops : [];
  return raw.map((stop, index) => ({
    id: stop.id || `stop_${index}`,
    position: Math.round(Math.min(1, Math.max(0, Number(stop.position) || 0)) * 10) / 10,
    color: stop.color || '#ffcc66',
    opacity: Number.isFinite(Number(stop.opacity)) ? Number(stop.opacity) : 1,
    size: Number.isFinite(Number(stop.size)) ? Number(stop.size) : 20,
    glow: Number.isFinite(Number(stop.glow)) ? Number(stop.glow) : 0
  }));
}

function installTextSpecificHelpers() {
  const layer = getActiveLayer();
  const grid = document.getElementById('effect-specific-grid');
  if (!grid || !isTextLayer(layer) || document.getElementById('text-helper-fields-v317')) return;
  const fields = document.createElement('div');
  fields.id = 'text-helper-fields-v317';
  fields.className = 'text-helper-fields-v317';
  fields.innerHTML = `
    <label>Text Density<input id="text-density-input-v317" type="range" min="1" max="10" step="0.1" value="${Number(layer.textDensity || layer.spawnRate || 4)}" /><output>${formatNumber(layer.textDensity || layer.spawnRate || 4)}</output></label>
    <label>Spawn Delay<input id="text-spawn-delay-input-v317" type="range" min="0" max="120" step="1" value="${Number(layer.textSpawnDelay || 0)}" /><output>${formatNumber(layer.textSpawnDelay || 0)}</output></label>
  `;
  grid.append(fields);
  document.getElementById('text-density-input-v317')?.addEventListener('input', (event) => {
    const value = Number(event.target.value) || 1;
    event.target.parentElement.querySelector('output').textContent = formatNumber(value);
    updateActiveLayer({ textDensity: value, spawnRate: value });
  });
  document.getElementById('text-spawn-delay-input-v317')?.addEventListener('input', (event) => {
    const value = Number(event.target.value) || 0;
    event.target.parentElement.querySelector('output').textContent = formatNumber(value);
    updateActiveLayer({ textSpawnDelay: value });
  });
}

function syncTextLayerUI() {
  const layer = getActiveLayer();
  const isText = isTextLayer(layer);
  document.body.classList.toggle('text-layer-active-v317', Boolean(isText));
  if (!isText) return;
  const density = document.getElementById('text-density-input-v317');
  if (density && document.activeElement !== density) density.value = Number(layer.textDensity || layer.spawnRate || 4);
  const delay = document.getElementById('text-spawn-delay-input-v317');
  if (delay && document.activeElement !== delay) delay.value = Number(layer.textSpawnDelay || 0);
}

function isTextLayer(layer) {
  return Boolean(layer && ((layer.appearanceMode === 'shape' && layer.particleShape === 'text') || layer.engine === 'text'));
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0';
  return Number.isInteger(number) ? String(number) : number.toFixed(1).replace(/\.0$/u, '');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}
