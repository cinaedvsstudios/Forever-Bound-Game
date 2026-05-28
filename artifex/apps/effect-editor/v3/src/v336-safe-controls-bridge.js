const VERSION_LABEL = 'V3.37-emergency';
let customControlsStarted = false;
let searchStarted = false;
let textControlsStarted = false;
let modules = null;
let moduleLoadStarted = false;

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

async function startSafeControls() {
  setVersionLabel();
  trimToolbarStatus();
  const loaded = await loadOptionalModules();
  if (!loaded) return;
  ensureSearch();
  ensureCustomControls();
  ensureTextRuntimeControls();
}

async function loadOptionalModules() {
  if (modules) return modules;
  if (moduleLoadStarted) return null;
  moduleLoadStarted = true;
  try {
    const [effectSpecific, textControls, leftSearch] = await Promise.all([
      import('./effect-specific-controls.js'),
      import('./v322-text-controls.js'),
      import('./v326-left-panel-search.js')
    ]);
    modules = { effectSpecific, textControls, leftSearch };
    return modules;
  } catch (error) {
    moduleLoadStarted = false;
    console.error('[Effect Editor V3.37] optional control modules failed to load', error);
    showBridgeToast('Optional controls failed to load, emergency shell stayed active.', 'warn');
    return null;
  }
}

function ensureSearch() {
  if (searchStarted) return;
  const leftPanel = document.getElementById('left-panel');
  if (!leftPanel || !modules?.leftSearch?.initV326LeftPanelSearch) return;
  safeRun('left panel search', () => modules.leftSearch.initV326LeftPanelSearch());
  searchStarted = Boolean(document.getElementById('left-panel-search-v326'));
}

function ensureCustomControls() {
  if (customControlsStarted) return;
  const leftPanel = document.getElementById('left-panel');
  const dynamics = Array.from(document.querySelectorAll('#left-panel .card')).find((card) => card.querySelector('h2')?.textContent?.trim() === 'Effect Layer Dynamics');
  if (!leftPanel || !dynamics || !modules?.effectSpecific?.initEffectSpecificControls) return;
  safeRun('custom controls', () => modules.effectSpecific.initEffectSpecificControls(showBridgeToast));
  customControlsStarted = Boolean(document.getElementById('effect-specific-controls-card'));
}

function ensureTextRuntimeControls() {
  if (textControlsStarted) return;
  if (!document.getElementById('effect-specific-controls-card') || !modules?.textControls?.initV322TextControls) return;
  safeRun('text runtime controls', () => modules.textControls.initV322TextControls(showBridgeToast));
  textControlsStarted = true;
}

function setVersionLabel() {
  document.title = `Artifex Effect Editor ${VERSION_LABEL}`;
  const badge = document.getElementById('version-badge');
  if (badge) badge.textContent = VERSION_LABEL;
}

function installBridgeStyles() {
  if (document.getElementById('v337-safe-controls-bridge-style')) return;
  const style = document.createElement('style');
  style.id = 'v337-safe-controls-bridge-style';
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
    console.error(`[Effect Editor V3.37] ${name} failed`, error);
    showBridgeToast(`${name} failed, emergency shell stayed active.`, 'warn');
  }
}
