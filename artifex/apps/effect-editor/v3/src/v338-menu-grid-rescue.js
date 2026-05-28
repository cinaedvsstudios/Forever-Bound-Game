import { editorState } from './editor-state.js';

const VERSION_LABEL = 'V3.38-emergency';

initV338MenuGridRescue();

function initV338MenuGridRescue() {
  setVersionLabel();
  forceGridOn();
  installStableMenuFallback();
  window.setTimeout(() => {
    setVersionLabel();
    forceGridOn();
    installStableMenuFallback();
  }, 250);
  window.setTimeout(() => {
    setVersionLabel();
    forceGridOn();
    installStableMenuFallback();
  }, 900);
}

function setVersionLabel() {
  document.title = `Artifex Effect Editor ${VERSION_LABEL}`;
  const badge = document.getElementById('version-badge');
  if (badge) badge.textContent = VERSION_LABEL;
}

function forceGridOn() {
  editorState.showGrid = true;
  const status = document.getElementById('status-text');
  if (status?.textContent?.includes('Grid Off')) {
    status.textContent = status.textContent.replace('Grid Off', 'Grid On');
  }
}

function installStableMenuFallback() {
  if (document.body.dataset.v338MenuRescue === 'true') return;
  document.body.dataset.v338MenuRescue = 'true';
  injectMenuStyles();
  document.addEventListener('click', (event) => {
    const button = event.target.closest('.menu-button');
    if (!button) return;
    const panel = document.getElementById(`menu-${button.dataset.menu}`);
    if (!panel) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const wasOpen = panel.classList.contains('open') || panel.classList.contains('v338-open');
    closeMenus();
    if (!wasOpen) panel.classList.add('open', 'v338-open');
  }, true);
  document.addEventListener('click', (event) => {
    if (event.target.closest('.menu-panel') || event.target.closest('.menu-button')) return;
    closeMenus();
  }, true);
}

function injectMenuStyles() {
  if (document.getElementById('v338-menu-grid-rescue-style')) return;
  const style = document.createElement('style');
  style.id = 'v338-menu-grid-rescue-style';
  style.textContent = `
    .menu-panel.open,
    .menu-panel.v338-open { display: block !important; }
    .workspace-toolbar #status-text { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  `;
  document.head.append(style);
}

function closeMenus() {
  document.querySelectorAll('.menu-panel.open, .menu-panel.v338-open').forEach((panel) => {
    panel.classList.remove('open', 'v338-open');
  });
}
