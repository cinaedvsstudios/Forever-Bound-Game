import { initEffectSpecificControls } from './effect-specific-controls.js';
import { initV322TextControls } from './v322-text-controls.js';
import { initV326LeftPanelSearch } from './v326-left-panel-search.js';

const VERSION_LABEL = 'V3.36-emergency';
let customControlsStarted = false;
let searchStarted = false;
let textControlsStarted = false;

initV336SafeControlsBridge();

export function initV336SafeControlsBridge() {
  setVersionLabel();
  installBridgeStyles();
  window.setTimeout(startSafeControls, 120);
  window.setTimeout(startSafeControls, 450);
  window.setTimeout(startSafeControls, 1100);
  window.setInterval(() => {
    setVersionLabel();
    trimToolbarStatus();
  }, 500);
}

function startSafeControls() {
  setVersionLabel();
  trimToolbarStatus();
  ensureSearch();
  ensureCustomControls();
  ensureTextRuntimeControls();
}

function ensureSearch() {
  if (searchStarted) return;
  const leftPanel = document.getElementById('left-panel');
  if (!leftPanel) return;
  safeRun('left panel search', () => initV326LeftPanelSearch());
  searchStarted = Boolean(document.getElementById('left-panel-search-v326'));
}

function ensureCustomControls() {
  if (customControlsStarted) return;
  const leftPanel = document.getElementById('left-panel');
  const dynamics = Array.from(document.querySelectorAll('#left-panel .card')).find((card) => card.querySelector('h2')?.textContent?.trim() === 'Effect Layer Dynamics');
  if (!leftPanel || !dynamics) return;
  safeRun('custom controls', () => initEffectSpecificControls(showBridgeToast));
  customControlsStarted = Boolean(document.getElementById('effect-specific-controls-card'));
}

function ensureTextRuntimeControls() {
  if (textControlsStarted) return;
  if (!document.getElementById('effect-specific-controls-card')) return;
  safeRun('text runtime controls', () => initV322TextControls(showBridgeToast));
  textControlsStarted = true;
}

function setVersionLabel() {
  document.title = `Artifex Effect Editor ${VERSION_LABEL}`;
  const badge = document.getElementById('version-badge');
  if (badge) badge.textContent = VERSION_LABEL;
}

function installBridgeStyles() {
  if (document.getElementById('v336-safe-controls-bridge-style')) return;
  const style = document.createElement('style');
  style.id = 'v336-safe-controls-bridge-style';
  style.textContent = `
    #left-panel-search-v326 { margin-bottom: 12px; }
    #effect-specific-controls-card h2 { font-size: 14px; }
    #effect-specific-controls-card:not(.is-hidden) { scroll-margin-top: 72px; }
    .workspace-toolbar #status-text {
      margin-left: auto;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `;
  document.head.append(style);
}

function trimToolbarStatus() {
  const status = document.getElementById('status-text');
  if (!status) return;
  const text = status.textContent || '';
  if (text.length <= 72) return;
  status.textContent = text
    .replace(/\n/g, ' · ')
    .replace(/\s+/g, ' ')
    .replace('Emergency shell · lower panel functional pass', '')
    .trim();
}

function showBridgeToast(message, type = 'info') {
  const area = document.getElementById('toast-area');
  if (!area) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  area.append(toast);
  window.setTimeout(() => toast.remove(), 2600);
}

function safeRun(name, action) {
  try {
    action();
  } catch (error) {
    console.error(`[Effect Editor V3.36] ${name} failed`, error);
    showBridgeToast(`${name} failed, emergency shell stayed active.`, 'warn');
  }
}
