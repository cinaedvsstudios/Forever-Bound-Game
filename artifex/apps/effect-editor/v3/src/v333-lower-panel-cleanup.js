const VERSION_LABEL = 'V3.34-emergency';

export function initV333LowerPanelCleanup() {
  window.setTimeout(applyLowerPanelCleanup, 80);
  window.setTimeout(applyLowerPanelCleanup, 350);
  window.setTimeout(applyLowerPanelCleanup, 900);
}

function applyLowerPanelCleanup() {
  setVersionLabel();
  injectStyles();
  const panel = document.getElementById('bottom-panel');
  if (!panel) return;
  const currentLayers = document.getElementById('layer-list')?.innerHTML || '<div class="layer-item"><strong>No layers yet</strong><span>Use Insert > Base Layer.</span></div>';
  const currentCount = document.getElementById('layer-count')?.textContent || '0 layers';
  panel.innerHTML = `
    <div class="lower-panel-grid-v334">
      <section class="lower-panel-card-v334 lower-panel-layers-v334">
        <header><h2>Layers</h2><span id="layer-count">${escapeHtml(currentCount)}</span></header>
        <div class="layer-toolbar-v334" aria-label="Layer actions">
          <button type="button" data-v334-action="layer-up" title="Move layer up.">↑</button>
          <button type="button" data-v334-action="layer-down" title="Move layer down.">↓</button>
          <button type="button" data-v334-action="layer-visible" title="Visibility toggle placeholder.">👁️</button>
          <button type="button" data-v334-action="duplicate" title="Duplicate active layer.">⧉</button>
          <button type="button" data-v334-action="delete" title="Delete active layer.">×</button>
        </div>
        <div id="layer-list" class="layer-list">${currentLayers}</div>
      </section>
      <section class="lower-panel-card-v334 lower-panel-display-v334">
        <header><h2>Display</h2></header>
        <div class="display-icon-grid-v334" aria-label="Display controls">
          <button type="button" data-v334-action="undo-view" title="Reserved display action.">↶</button>
          <button type="button" data-v334-action="redo-view" title="Reserved display action.">↷</button>
          <button type="button" data-v334-action="performance" title="Low performance mode is active in emergency shell.">⏱️</button>
          <button type="button" data-v334-action="grid" title="Toggle grid.">🖌️</button>
          <button type="button" data-v334-action="helpers" title="Toggle guides.">🐢</button>
          <button type="button" data-v334-action="snapshot" title="Save snapshot.">💾</button>
          <button type="button" data-v334-action="background" title="Toggle dark / white background.">BG</button>
          <button type="button" data-v334-action="folder" title="Open local effects if available.">📁</button>
        </div>
      </section>
      <section class="lower-panel-card-v334 lower-panel-diagnostics-v334">
        <header><h2>Diagnostics</h2></header>
        <div id="emergency-diagnostics-v334" class="diagnostic-readout-v334">Emergency shell active.</div>
      </section>
    </div>
  `;
  bindLowerPanelButtons();
  updateDiagnostics();
}

function bindLowerPanelButtons() {
  document.querySelectorAll('[data-v334-action]').forEach((button) => {
    if (button.dataset.v334Bound === 'true') return;
    button.dataset.v334Bound = 'true';
    button.addEventListener('click', () => runAction(button.dataset.v334Action));
  });
}

function runAction(action) {
  const click = (id) => document.getElementById(id)?.click();
  if (action === 'duplicate') click('duplicate-layer-button');
  else if (action === 'delete') click('delete-layer-button');
  else if (action === 'grid') click('toggle-grid-button');
  else if (action === 'helpers') click('toggle-helpers-button');
  else if (action === 'snapshot') click('snapshot-button');
  else if (action === 'folder') click('view-local-button');
  else if (action === 'background') toggleWorkspaceBackground();
  else showSmallStatus('Reserved until full lower-panel controls are restored.');
  updateDiagnostics();
}

function toggleWorkspaceBackground() {
  const dark = document.querySelector('[data-workspace-mode="dark"]');
  const white = document.querySelector('[data-workspace-mode="white"]');
  const isWhite = document.body.dataset.v334Workspace === 'white';
  document.body.dataset.v334Workspace = isWhite ? 'dark' : 'white';
  (isWhite ? dark : white)?.click();
}

function setVersionLabel() {
  document.title = `Artifex Effect Editor ${VERSION_LABEL}`;
  const badge = document.getElementById('version-badge');
  if (badge) badge.textContent = VERSION_LABEL;
}

function injectStyles() {
  if (document.getElementById('v334-lower-panel-style')) return;
  const style = document.createElement('style');
  style.id = 'v334-lower-panel-style';
  style.textContent = `
    .lower-panel-grid-v334 { display: grid; grid-template-columns: minmax(330px, 1.55fr) minmax(210px, .7fr) minmax(310px, 1fr); gap: 14px; min-height: 100%; }
    .lower-panel-card-v334 { min-width: 0; border-left: 1px solid rgba(56,42,33,.75); padding-left: 14px; }
    .lower-panel-card-v334:first-child { border-left: 0; padding-left: 0; }
    .layer-toolbar-v334 { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 10px; }
    .layer-toolbar-v334 button, .display-icon-grid-v334 button { min-width: 38px; min-height: 38px; padding: 6px 9px; border-radius: 14px; }
    .lower-panel-layers-v334 .layer-list { margin-top: 4px; }
    .display-icon-grid-v334 { display: grid; grid-template-columns: repeat(3, minmax(38px, 48px)); gap: 9px; align-items: center; justify-content: start; margin-top: 8px; }
    .display-icon-grid-v334 button:nth-child(7), .display-icon-grid-v334 button:nth-child(8) { grid-column: auto; }
    .lower-panel-diagnostics-v334 header { margin-bottom: 8px; }
    .diagnostic-readout-v334 { color: var(--module-accent-strong); font-family: 'Fira Code', monospace; font-size: 12px; line-height: 1.55; white-space: pre-wrap; }
    @media (max-width: 1100px) { .lower-panel-grid-v334 { grid-template-columns: 1fr; } }
  `;
  document.head.append(style);
}

function updateDiagnostics() {
  const target = document.getElementById('emergency-diagnostics-v334');
  if (!target) return;
  const topStatus = document.getElementById('status-text')?.textContent || '';
  const layerCount = document.getElementById('layer-count')?.textContent || '0 layers';
  target.textContent = `${compact(topStatus)}\nLayers ${layerCount}\nEmergency shell · lower panel restored to screenshot layout`;
}

function showSmallStatus(message) {
  const target = document.getElementById('emergency-diagnostics-v334');
  if (target) target.textContent = message;
}

function compact(value) {
  return String(value || 'Ready.').replace(/\s*\|\s*/g, '\n').replace(/\s{2,}/g, ' ').trim();
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

initV333LowerPanelCleanup();
