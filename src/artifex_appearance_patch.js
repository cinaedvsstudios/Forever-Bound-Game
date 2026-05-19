/* Artifex Appearance Patch
   Adds live appearance controls without replacing artifex_game.js. */
(() => {
  'use strict';

  const STORAGE_KEY = 'foreverBound.artifex.appearance.v1';
  const DEFAULTS = {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    colors: {
      topBarBackground: '#16051f',
      topBarText: '#d58cff',
      primaryButtonBackground: '#3b1258',
      primaryButtonBorder: '#b66cff',
      primaryButtonText: '#ffffff',
      panelBackground: '#180b08',
      cardBackground: '#24100c',
      cardBorder: '#a86436',
      headingText: '#ffb36b',
      bodyText: '#fff4d2',
      mutedText: '#c8a982',
      inputBackground: '#120705',
      inputText: '#ffffff',
      scrollbar: '#b87848',
      guideColor: '#b66cff',
      selectedElement: '#d58cff'
    },
    backgroundImages: {
      editorPage: '',
      topBar: '',
      leftSidebar: '',
      rightSidebar: '',
      settingsModal: '',
      cards: ''
    },
    opacity: {
      leftSidebarCards: 95,
      rightSidebarCards: 95,
      settingsModal: 98,
      topBar: 98
    },
    layout: {
      showRightPanelByDefault: false
    },
    branding: {
      titleColor: '#d58cff',
      logoHasBorder: false
    }
  };

  let appliedShell = new WeakSet();
  let appearance = merge(DEFAULTS, load());

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function merge(base, override) {
    const output = clone(base);
    for (const [key, value] of Object.entries(override || {})) {
      if (value && typeof value === 'object' && !Array.isArray(value) && output[key] && typeof output[key] === 'object') {
        output[key] = merge(output[key], value);
      } else {
        output[key] = value;
      }
    }
    return output;
  }

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance, null, 2));
  }

  function get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], appearance);
  }

  function set(path, value) {
    const parts = path.split('.');
    let obj = appearance;
    while (parts.length > 1) {
      const key = parts.shift();
      obj[key] ||= {};
      obj = obj[key];
    }
    obj[parts[0]] = value;
    save();
    apply();
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[ch]));
  }

  function cssUrl(value) {
    const raw = String(value || '').trim();
    return raw ? `url("${raw.replace(/"/g, '\\"')}")` : 'none';
  }

  function alpha(value, fallback) {
    const n = Number(value);
    return Math.max(0, Math.min(100, Number.isFinite(n) ? n : fallback)) / 100;
  }

  function apply() {
    const c = appearance.colors;
    const img = appearance.backgroundImages;
    const op = appearance.opacity;
    let style = document.getElementById('artifex-appearance-live-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'artifex-appearance-live-style';
      document.head.appendChild(style);
    }

    style.textContent = `
      html, body, #app, .artifex-shell, .artifex-shell * { font-family: ${appearance.fontFamily} !important; }
      .artifex-shell { color: ${c.bodyText} !important; background-image: ${cssUrl(img.editorPage)} !important; background-size: cover !important; background-position: center !important; }
      .artifex-topbar { background-image: ${cssUrl(img.topBar)}, linear-gradient(180deg, ${c.topBarBackground}, rgba(5,2,8,${alpha(op.topBar, 98)})) !important; background-size: cover !important; background-position: center !important; }
      .artifex-brand { color: ${appearance.branding.titleColor || c.topBarText} !important; border: 0 !important; outline: 0 !important; box-shadow: none !important; background: transparent !important; text-shadow: 0 0 14px rgba(213,140,255,.65) !important; }
      .artifex-brand img, .artifex-brand svg, .artifex-brand .brand-icon, .artifex-brand::before { border: 0 !important; outline: 0 !important; box-shadow: none !important; background: transparent !important; }
      .artifex-shell button, .artifex-shell .editor-pill, .artifex-shell .editor-icon-button, .artifex-topbar a { background-color: ${c.primaryButtonBackground} !important; border-color: ${c.primaryButtonBorder} !important; color: ${c.primaryButtonText} !important; }
      .artifex-shell .is-active, .artifex-shell button.is-active, .artifex-shell .editor-pill.is-active { border-color: ${c.selectedElement} !important; box-shadow: 0 0 16px ${c.selectedElement}88 !important; }
      .editor-panel.left { background-image: ${cssUrl(img.leftSidebar)}, linear-gradient(180deg, ${c.panelBackground}, #050407) !important; background-size: cover !important; background-position: center !important; }
      .editor-panel.right { background-image: ${cssUrl(img.rightSidebar)}, linear-gradient(180deg, ${c.panelBackground}, #050407) !important; background-size: cover !important; background-position: center !important; }
      .editor-panel.left .editor-section, .editor-panel.left details.editor-section, .editor-panel.left .panel-card { background-color: color-mix(in srgb, ${c.cardBackground} ${Math.round(alpha(op.leftSidebarCards, 95) * 100)}%, transparent) !important; background-image: ${cssUrl(img.cards)} !important; background-size: cover !important; background-position: center !important; border-color: ${c.cardBorder} !important; }
      .editor-panel.right .editor-section, .editor-panel.right details.editor-section, .editor-panel.right .panel-card { background-color: color-mix(in srgb, ${c.cardBackground} ${Math.round(alpha(op.rightSidebarCards, 95) * 100)}%, transparent) !important; background-image: ${cssUrl(img.cards)} !important; background-size: cover !important; background-position: center !important; border-color: ${c.cardBorder} !important; }
      .artifex-shell h1, .artifex-shell h2, .artifex-shell h3, .artifex-shell summary h3 { color: ${c.headingText} !important; }
      .artifex-shell, .artifex-shell p, .artifex-shell label, .artifex-shell .small-text { color: ${c.bodyText} !important; }
      .artifex-shell .small-text, .artifex-shell .upload-note, .artifex-shell .file-name-pill { color: ${c.mutedText} !important; }
      .artifex-shell input, .artifex-shell textarea, .artifex-shell select { background-color: ${c.inputBackground} !important; color: ${c.inputText} !important; border-color: ${c.cardBorder} !important; }
      .artifex-shell input[type='checkbox'] { accent-color: ${c.selectedElement}; }
      .editor-grid, .editor-grid *, .grid-line, .grid-label, .editor-grid-label { border-color: ${c.guideColor} !important; color: ${c.guideColor} !important; }
      .editor-element.selected, .stage-element.selected, .editor-element.is-selected, .stage-element.is-selected { outline-color: ${c.selectedElement} !important; box-shadow: 0 0 18px ${c.selectedElement}cc !important; }
      .settings-modal, .settings-window, .artifex-settings-modal, .editor-modal, .tutorial-window, .modal-content, .modal-card, [role='dialog'] { background-color: color-mix(in srgb, ${c.panelBackground} ${Math.round(alpha(op.settingsModal, 98) * 100)}%, transparent) !important; background-image: ${cssUrl(img.settingsModal)} !important; background-size: cover !important; background-position: center !important; }
      .artifex-shell ::-webkit-scrollbar { width: 12px; height: 12px; }
      .artifex-shell ::-webkit-scrollbar-thumb { background: ${c.scrollbar}; border-radius: 999px; }
    `;
  }

  function field(label, type, path, attrs = '') {
    return `<label><span>${esc(label)}</span><input type="${type}" data-af-appearance="${esc(path)}" value="${esc(get(path))}" ${attrs}></label>`;
  }

  function checkbox(label, path) {
    return `<label><span>${esc(label)}</span><input type="checkbox" data-af-appearance="${esc(path)}" ${get(path) ? 'checked' : ''}></label>`;
  }

  function findSettingsHost() {
    const selectors = ['.settings-modal', '.settings-window', '.artifex-settings-modal', '.editor-modal', '.modal-content', '.modal-card', '[role="dialog"]'];
    for (const selector of selectors) {
      const found = [...document.querySelectorAll(selector)].find(el => /Artifex Settings|Settings/i.test(el.textContent || '') && el.querySelector('input,textarea,button'));
      if (found) return found;
    }
    const heading = [...document.querySelectorAll('h1,h2,h3,summary')].find(el => /Artifex Settings|Settings/i.test(el.textContent || ''));
    return heading?.closest('section,dialog,div') || null;
  }

  function injectPanel() {
    const host = findSettingsHost();
    if (!host || host.querySelector('.artifex-appearance-card')) return;

    const panel = document.createElement('section');
    panel.className = 'editor-section artifex-appearance-card';
    panel.innerHTML = `
      <h3>Appearance / Custom Colours</h3>
      <div class="artifex-font-row">${field('Editor font family', 'text', 'fontFamily')}</div>
      <div class="artifex-appearance-grid">
        ${field('Top bar background', 'color', 'colors.topBarBackground')}
        ${field('Title / top text', 'color', 'branding.titleColor')}
        ${field('Button background', 'color', 'colors.primaryButtonBackground')}
        ${field('Button border', 'color', 'colors.primaryButtonBorder')}
        ${field('Button text', 'color', 'colors.primaryButtonText')}
        ${field('Panel background', 'color', 'colors.panelBackground')}
        ${field('Card background', 'color', 'colors.cardBackground')}
        ${field('Card border', 'color', 'colors.cardBorder')}
        ${field('Heading text', 'color', 'colors.headingText')}
        ${field('Body text', 'color', 'colors.bodyText')}
        ${field('Muted text', 'color', 'colors.mutedText')}
        ${field('Input background', 'color', 'colors.inputBackground')}
        ${field('Input text', 'color', 'colors.inputText')}
        ${field('Scrollbar', 'color', 'colors.scrollbar')}
        ${field('Guide / grid colour', 'color', 'colors.guideColor')}
        ${field('Selected element', 'color', 'colors.selectedElement')}
        ${field('Editor page background URL', 'text', 'backgroundImages.editorPage', 'placeholder="assets/ui/background.png"')}
        ${field('Top bar background URL', 'text', 'backgroundImages.topBar', 'placeholder="assets/ui/topbar.png"')}
        ${field('Left sidebar background URL', 'text', 'backgroundImages.leftSidebar', 'placeholder="assets/ui/left_panel.png"')}
        ${field('Right sidebar background URL', 'text', 'backgroundImages.rightSidebar', 'placeholder="assets/ui/right_panel.png"')}
        ${field('Settings modal background URL', 'text', 'backgroundImages.settingsModal', 'placeholder="assets/ui/modal.png"')}
        ${field('Card background URL', 'text', 'backgroundImages.cards', 'placeholder="assets/ui/card.png"')}
      </div>
      <div class="artifex-opacity-row">
        ${field('Left sidebar card opacity', 'range', 'opacity.leftSidebarCards', 'min="20" max="100" step="1"')}
        ${field('Right sidebar card opacity', 'range', 'opacity.rightSidebarCards', 'min="20" max="100" step="1"')}
        ${field('Settings modal opacity', 'range', 'opacity.settingsModal', 'min="20" max="100" step="1"')}
        ${field('Top bar opacity', 'range', 'opacity.topBar', 'min="20" max="100" step="1"')}
        ${checkbox('Show right panel by default', 'layout.showRightPanelByDefault')}
      </div>
      <div class="artifex-appearance-actions">
        <button type="button" class="editor-pill" data-af-action="download">Download appearance JSON</button>
        <button type="button" class="editor-pill" data-af-action="reset">Reset appearance</button>
      </div>
      <div class="artifex-appearance-note">These settings update live and are saved in this browser.</div>
    `;
    host.appendChild(panel);

    panel.querySelectorAll('[data-af-appearance]').forEach(input => {
      const update = () => {
        set(input.dataset.afAppearance, input.type === 'checkbox' ? input.checked : input.value);
        if (input.dataset.afAppearance === 'layout.showRightPanelByDefault') setRightPanelVisible(input.checked);
      };
      input.addEventListener('input', update);
      input.addEventListener('change', update);
    });
    panel.querySelector('[data-af-action="download"]')?.addEventListener('click', downloadSettings);
    panel.querySelector('[data-af-action="reset"]')?.addEventListener('click', () => {
      appearance = clone(DEFAULTS);
      save();
      apply();
      panel.remove();
      injectPanel();
      setRightPanelVisible(false);
    });
  }

  function downloadSettings() {
    const blob = new Blob([JSON.stringify({ id: 'artifex_editor_settings_appearance', version: '1.0.0', appearance }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'editor_settings.appearance.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function rightPanelIsVisible() {
    const shell = document.querySelector('.artifex-shell');
    const panel = document.querySelector('#rightPanel');
    if (!shell || !panel) return true;
    if (shell.classList.contains('no-right') || shell.classList.contains('artifex-force-right-hidden')) return false;
    return getComputedStyle(panel).display !== 'none';
  }

  function setRightPanelVisible(visible) {
    const shell = document.querySelector('.artifex-shell');
    const panel = document.querySelector('#rightPanel');
    const button = document.querySelector('#rightPanelBtn');
    if (!shell || !panel) return;
    if (button && rightPanelIsVisible() !== visible) {
      button.click();
      return;
    }
    shell.classList.toggle('artifex-force-right-hidden', !visible);
    panel.style.display = visible ? '' : 'none';
  }

  function applyRightPanelDefault() {
    const shell = document.querySelector('.artifex-shell');
    if (!shell || appliedShell.has(shell)) return;
    appliedShell.add(shell);
    setRightPanelVisible(Boolean(appearance.layout.showRightPanelByDefault));
  }

  function tick() {
    apply();
    applyRightPanelDefault();
    injectPanel();
  }

  new MutationObserver(() => requestAnimationFrame(tick)).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', tick);
  window.addEventListener('load', tick);
  setInterval(tick, 1200);
  tick();
})();
