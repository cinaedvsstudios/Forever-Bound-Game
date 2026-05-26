import { editorState, onStateChange, updateActiveLayer } from './editor-state.js';

const LEFT_CARD_KEY = 'artifex-effect-editor-left-card-collapse-v3';
const BOTTOM_PANEL_KEY = 'artifex-effect-editor-bottom-panel-collapsed-v1';

export function initUIPolishV2(showToast = () => {}) {
  injectStyles();
  removeThemeControls();
  compactWorkspaceButtons();
  iconizeLayerToolbar();
  installHelperCards(showToast);
  installLeftCardCollapseButtons();
  installBottomPanelCollapseButton();
  normalizeLeftPanelText();
  onStateChange(() => {
    compactWorkspaceButtons();
    iconizeLayerToolbar();
    installLeftCardCollapseButtons();
    installBottomPanelCollapseButton();
  });
}

function injectStyles() {
  if (document.getElementById('ui-polish-v2-style')) return;
  const style = document.createElement('style');
  style.id = 'ui-polish-v2-style';
  style.textContent = `
    #module-theme-select, #menu-view [data-module-theme] { display: none !important; }
    #left-panel .card h2, #left-panel .brush-library-panel h3, #left-panel label, #left-panel button, #left-panel input, #left-panel select, #left-panel output, #left-panel .render-choice-status, #left-panel .brush-library-note, #left-panel .appearance-stop-buttons span { font-size: 11px; line-height: 1.25; }
    #left-panel .card h2, #left-panel .helper-card h2 { font-size: 13px; letter-spacing: .16em; }
    #left-panel button { min-height: 34px; }
    .helper-card-title-dot { display:inline-block; width:9px; height:9px; margin-right:9px; border-radius:50%; background:var(--module-accent); box-shadow:0 0 12px var(--module-glow); vertical-align:middle; }
    .helper-info-button { margin-left:auto; min-width:24px; min-height:24px; padding:1px 6px; border-radius:5px; background:linear-gradient(180deg,#58a0ff 0%,#1d4f99 100%); color:white; font-size:11px; }
    .helper-grid { display:grid; grid-template-columns:1fr 1fr; gap:9px 10px; margin-top:11px; }
    .helper-grid button { border-color:rgba(0,174,234,.25); background:linear-gradient(180deg,#252b31 0%,#1d2227 100%); }
    .layer-stack-toolbar button { width:32px; min-width:32px; padding-left:0; padding-right:0; font-size:14px; }
    .layer-stack-toolbar .layer-stack-hint { font-size:9px; }
    .card-collapse-button, .bottom-panel-collapse-button { margin-left:auto; min-width:32px; min-height:27px; padding:2px 7px; border-radius:8px; font-size:14px; text-align:center; }
    .collapsible-card.is-collapsed > :not(header) { display:none !important; }
    .collapsible-card > header, #bottom-panel > header { display:flex; align-items:center; gap:8px; }
    #bottom-panel.is-collapsed > :not(header) { display:none !important; }
    #workspace-mode-cycle-button.bg-mode-dark { background:linear-gradient(180deg,#0a0909 0%,#000 100%); color:#f6e7c8; }
    #workspace-mode-cycle-button.bg-mode-white { background:linear-gradient(180deg,#fff 0%,#dedede 100%); color:#111; }
    #workspace-mode-cycle-button.bg-mode-underlay { background:linear-gradient(90deg,#ff3158 0%,#ffc64d 25%,#49d86e 50%,#2cc8ff 75%,#b25cff 100%); color:white; text-shadow:0 1px 2px rgba(0,0,0,.8); }
    #helper-cycle-button { min-width:72px; }
    #helper-cycle-button.guides-active { border-color:var(--module-accent) !important; box-shadow:0 0 14px var(--module-glow) !important; color:white; }
    #toggle-reference-button { display:none !important; }
    .workspace-extra-controls { flex-wrap: nowrap !important; overflow-x: auto; gap: 7px !important; }
    .workspace-extra-controls button, .workspace-extra-controls .reference-file-label { min-width: 42px; text-align:center; padding-left: 9px; padding-right: 9px; }
    #low-performance-button, #low-performance-button-playback { min-width: 42px; }
  `;
  document.head.append(style);
}

function removeThemeControls() {
  document.getElementById('module-theme-select')?.remove();
  document.querySelectorAll('#menu-view [data-module-theme]').forEach((button) => button.remove());
  Array.from(document.querySelectorAll('#menu-view .menu-section-title')).forEach((title) => {
    if (!/Module Accent/i.test(title.textContent || '')) return;
    let node = title.nextElementSibling;
    title.remove();
    while (node && !node.classList.contains('menu-section-title')) {
      const next = node.nextElementSibling;
      node.remove();
      if (node.classList?.contains('menu-divider')) break;
      node = next;
    }
  });
}

function compactWorkspaceButtons() {
  const bg = document.getElementById('workspace-mode-cycle-button');
  if (bg) {
    bg.textContent = 'BG';
    bg.title = 'Cycle preview background: black, white, or underlay.';
    bg.classList.remove('bg-mode-dark', 'bg-mode-white', 'bg-mode-underlay');
    const mode = editorState.workspaceMode === 'white' ? 'white' : editorState.workspaceMode === 'underlay' ? 'underlay' : 'dark';
    bg.classList.add(`bg-mode-${mode}`);
  }
  const guides = document.getElementById('helper-cycle-button');
  if (guides) {
    guides.textContent = 'Guides';
    guides.title = 'Toggle grid and emitter guides.';
    guides.classList.toggle('guides-active', editorState.showGrid || editorState.showHelpers);
  }
  const underlayLabel = document.querySelector('.reference-file-label');
  if (underlayLabel) {
    underlayLabel.childNodes.forEach((node) => { if (node.nodeType === Node.TEXT_NODE) node.textContent = ''; });
    if (!underlayLabel.querySelector('.underlay-emoji-label')) {
      underlayLabel.insertAdjacentHTML('afterbegin', '<span class="underlay-emoji-label">🖼️</span>');
    }
    underlayLabel.title = 'Load an image or video underlay.';
  }
  const perf = document.getElementById('low-performance-button');
  if (perf) {
    perf.textContent = '🐢';
    perf.title = editorState.lowPerformanceMode ? 'Low Performance Mode is on.' : 'Toggle Low Performance Mode.';
  }
  const perfBottom = document.getElementById('low-performance-button-playback');
  if (perfBottom) {
    perfBottom.textContent = '🐢';
    perfBottom.title = 'Toggle Low Performance Mode.';
  }
  const clearReference = document.getElementById('clear-reference-button');
  if (clearReference) clearReference.textContent = '🗑️';
  const frameBack = document.getElementById('reference-frame-back-button');
  if (frameBack) frameBack.textContent = '◀';
  const frameForward = document.getElementById('reference-frame-forward-button');
  if (frameForward) frameForward.textContent = '▶';
  document.getElementById('toggle-reference-button')?.remove();
}

function iconizeLayerToolbar() {
  const map = { 'active-up': ['↑','Move selected layer up'], 'active-down': ['↓','Move selected layer down'], 'show-all': ['👁','Show all layers'], duplicate: ['⧉','Duplicate selected layer'], delete: ['×','Delete selected layer'] };
  document.querySelectorAll('#layer-stack-toolbar button').forEach((button) => {
    const data = map[button.dataset.action];
    if (!data) return;
    button.textContent = data[0];
    button.title = data[1];
    if (button.dataset.action === 'delete') button.classList.add('is-danger');
  });
}

function installHelperCards(showToast) {
  if (document.getElementById('appearance-helper-card')) return;
  const quickCard = Array.from(document.querySelectorAll('#left-panel .card')).find((card) => card.querySelector('h2')?.textContent?.trim() === 'Quick Edit Presets');
  if (!quickCard) return;
  quickCard.insertAdjacentHTML('afterend', `${cardHtml('appearance-helper-card','Appearance Helpers','appearance',['Soft Glow','Sharp Sparks','Fade In/Out','Bright Add','White Fog','Sooty Smoke'])}${cardHtml('colour-helper-card','Colour Helpers','colour',['Fire','Ice','Water','Dark Magic','Good Magic','Evil'])}${cardHtml('dynamics-helper-card','Dynamics Helpers','dynamics',['Slow Drift','Burst Out','Rise Up','Tight Trail'])}`);
  document.querySelectorAll('[data-helper-preset]').forEach((button) => button.addEventListener('click', () => {
    applyHelper(button.dataset.helperPreset);
    showToast(`${button.textContent.trim()} helper applied.`, 'success');
  }));
  document.querySelectorAll('.helper-info-button').forEach((button) => button.addEventListener('click', () => showToast(button.title, 'info')));
}

function cardHtml(id, title, group, labels) {
  return `<section id="${id}" class="card helper-card collapsible-card"><header><h2><span class="helper-card-title-dot"></span>${title}</h2><button class="helper-info-button" type="button" title="${title} quickly applies common effect settings.">i</button></header><div class="helper-grid">${labels.map((label) => `<button type="button" data-helper-preset="${group}:${slug(label)}">${label}</button>`).join('')}</div></section>`;
}

function slug(label) { return label.toLowerCase().replace(/[^a-z0-9]+/g, '-'); }

function applyHelper(id) {
  const patches = {
    'appearance:soft-glow': { glow:24, edgeBlur:1.2, blendMode:'screen', textureContrast:.9 },
    'appearance:sharp-sparks': { appearanceMode:'brush', builtInBrush:'spark', glow:10, edgeBlur:0, sizeStart:10, sizeEnd:1, textureContrast:1.45 },
    'appearance:fade-in-out': { appearanceStops:[{position:0,color:'#ffcc66',opacity:0,size:4,glow:0},{position:.5,color:'#fff1a8',opacity:1,size:18,glow:18},{position:1,color:'#ff6600',opacity:0,size:2,glow:0}] },
    'appearance:bright-add': { blendMode:'lighter', glow:34, alphaStart:1, textureAlpha:1 },
    'appearance:white-fog': { engine:'gas', appearanceMode:'brush', builtInBrush:'smoke-puff', blendMode:'screen', appearanceStops:[{position:0,color:'#ffffff',opacity:.45,size:38,glow:3},{position:1,color:'#dce8ff',opacity:0,size:72,glow:0}] },
    'appearance:sooty-smoke': { engine:'gas', appearanceMode:'brush', builtInBrush:'smoke-puff', blendMode:'source-over', appearanceStops:[{position:0,color:'#2b221c',opacity:.5,size:28,glow:0},{position:1,color:'#050505',opacity:0,size:68,glow:0}] },
    'colour:fire': { appearanceStops:[{position:0,color:'#fff1a8',opacity:1,size:24,glow:34},{position:.5,color:'#ff8a00',opacity:.8,size:18,glow:24},{position:1,color:'#ff2600',opacity:0,size:5,glow:0}] },
    'colour:ice': { appearanceStops:[{position:0,color:'#ffffff',opacity:.95,size:18,glow:22},{position:.5,color:'#99f2ff',opacity:.7,size:14,glow:16},{position:1,color:'#00a1d7',opacity:0,size:2,glow:0}] },
    'colour:water': { appearanceStops:[{position:0,color:'#dffbff',opacity:.9,size:18,glow:10},{position:.5,color:'#38b6ff',opacity:.75,size:20,glow:12},{position:1,color:'#0356a6',opacity:0,size:5,glow:0}] },
    'colour:dark-magic': { appearanceStops:[{position:0,color:'#7cff00',opacity:.9,size:20,glow:20},{position:.4,color:'#5b148c',opacity:.75,size:24,glow:18},{position:1,color:'#07100a',opacity:0,size:6,glow:0}] },
    'colour:good-magic': { appearanceStops:[{position:0,color:'#fff7cf',opacity:1,size:18,glow:30},{position:.5,color:'#d65cff',opacity:.85,size:22,glow:34},{position:1,color:'#5e8cff',opacity:0,size:8,glow:0}] },
    'colour:evil': { appearanceStops:[{position:0,color:'#ff003c',opacity:.95,size:19,glow:24},{position:.5,color:'#5800a8',opacity:.8,size:24,glow:20},{position:1,color:'#020006',opacity:0,size:7,glow:0}] },
    'dynamics:slow-drift': { speedMin:.2, speedMax:1.2, gravity:-.002, spread:140, friction:.01, noiseGrain:.2 },
    'dynamics:burst-out': { speedMin:5, speedMax:14, spread:360, gravity:.01, lifetime:52, spawnRate:42 },
    'dynamics:rise-up': { angle:-90, spread:46, speedMin:1.4, speedMax:5.2, gravity:-.025, lifetime:96 },
    'dynamics:tight-trail': { spread:8, speedMin:2.2, speedMax:3.8, lifetime:44, spawnRate:34, friction:.02 }
  };
  if (patches[id]) updateActiveLayer(patches[id]);
}

function installLeftCardCollapseButtons() {
  const state = collapseState(LEFT_CARD_KEY);
  document.querySelectorAll('#left-panel .card').forEach((card, index) => {
    const header = card.querySelector(':scope > header');
    if (!header || header.querySelector('.card-collapse-button')) return;
    card.classList.add('collapsible-card');
    const key = cardKey(card, index);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'card-collapse-button';
    button.title = 'Collapse or expand this card.';
    const collapsed = Boolean(state[key]);
    button.textContent = collapsed ? '⏬' : '⏫';
    card.classList.toggle('is-collapsed', collapsed);
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const nextCollapsed = !card.classList.contains('is-collapsed');
      card.classList.toggle('is-collapsed', nextCollapsed);
      button.textContent = nextCollapsed ? '⏬' : '⏫';
      const next = collapseState(LEFT_CARD_KEY);
      next[key] = nextCollapsed;
      localStorage.setItem(LEFT_CARD_KEY, JSON.stringify(next));
    });
    header.append(button);
  });
}

function installBottomPanelCollapseButton() {
  const panel = document.getElementById('bottom-panel');
  const header = panel?.querySelector(':scope > header');
  if (!panel || !header || document.getElementById('bottom-panel-collapse-button')) return;
  const saved = localStorage.getItem(BOTTOM_PANEL_KEY) === 'true';
  panel.classList.toggle('is-collapsed', saved);
  const button = document.createElement('button');
  button.id = 'bottom-panel-collapse-button';
  button.type = 'button';
  button.className = 'bottom-panel-collapse-button';
  button.title = 'Collapse or expand the whole bottom panel.';
  button.textContent = saved ? '⏬' : '⏫';
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    const collapsed = !panel.classList.contains('is-collapsed');
    panel.classList.toggle('is-collapsed', collapsed);
    button.textContent = collapsed ? '⏬' : '⏫';
    localStorage.setItem(BOTTOM_PANEL_KEY, String(collapsed));
  });
  header.append(button);
}

function cardKey(card, index) {
  const title = card.querySelector('h2')?.textContent?.trim() || card.id || `card-${index}`;
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function collapseState(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
}

function normalizeLeftPanelText() {
  document.getElementById('left-panel')?.classList.add('left-panel-normalized-text');
}
