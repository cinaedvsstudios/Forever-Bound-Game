const VERSION_LABEL = 'V3.35-emergency';

export function initV333LowerPanelCleanup() {
  window.setTimeout(applyLowerPanelCleanup, 80);
  window.setTimeout(applyLowerPanelCleanup, 350);
  window.setTimeout(applyLowerPanelCleanup, 900);
  window.setInterval(refreshLowerPanelReadouts, 750);
}

function applyLowerPanelCleanup() {
  setVersionLabel();
  injectStyles();
  const panel = document.getElementById('bottom-panel');
  if (!panel) return;
  const currentLayers = document.getElementById('layer-list')?.innerHTML || '<div class="layer-item"><strong>No layers yet</strong><span>Use Insert > Base Layer.</span></div>';
  const currentCount = document.getElementById('layer-count')?.textContent || '0 layers';
  panel.innerHTML = `
    <div class="lower-panel-grid-v335">
      <section class="lower-panel-card-v335 lower-panel-layers-v335">
        <header><h2>Layers</h2><span id="layer-count">${escapeHtml(currentCount)}</span></header>
        <div class="layer-toolbar-v335" aria-label="Layer actions">
          <button type="button" data-v335-action="layer-up" title="Move layer up.">↑</button>
          <button type="button" data-v335-action="layer-down" title="Move layer down.">↓</button>
          <button type="button" data-v335-action="layer-visible" title="Visibility toggle placeholder.">👁️</button>
          <button type="button" data-v335-action="duplicate" title="Duplicate active layer.">⧉</button>
          <button type="button" data-v335-action="delete" title="Delete active layer.">×</button>
        </div>
        <div id="layer-list" class="layer-list">${currentLayers}</div>
      </section>
      <section class="lower-panel-card-v335 lower-panel-display-v335">
        <header><h2>Display</h2><span id="display-state-v335">Emergency</span></header>
        <div class="display-icon-grid-v335" aria-label="Display controls">
          <button type="button" data-v335-action="pause" id="display-pause-v335" title="Pause or resume preview.">▶</button>
          <button type="button" data-v335-action="snapshot" title="Save snapshot.">📸</button>
          <button type="button" data-v335-action="grid" title="Toggle grid.">▦</button>
          <button type="button" data-v335-action="helpers" title="Toggle guides.">🎯</button>
          <button type="button" data-v335-action="background" title="Toggle dark / white background.">BG</button>
          <button type="button" data-v335-action="folder" title="Open local effects if available.">📁</button>
        </div>
        <div class="zoom-strip-v335" aria-label="Zoom controls">
          <button type="button" data-v335-action="zoom-out" title="Zoom out.">−</button>
          <span id="zoom-readout-bottom-v335">100%</span>
          <button type="button" data-v335-action="zoom-in" title="Zoom in.">+</button>
          <button type="button" data-v335-action="zoom-reset" title="Reset zoom.">Reset</button>
        </div>
      </section>
      <section class="lower-panel-card-v335 lower-panel-diagnostics-v335">
        <header><h2>Diagnostics</h2></header>
        <div id="emergency-diagnostics-v335" class="diagnostic-readout-v335">Emergency shell active.</div>
      </section>
    </div>
  `;
  bindLowerPanelButtons();
  refreshLowerPanelReadouts();
}

function bindLowerPanelButtons() {
  document.querySelectorAll('[data-v335-action]').forEach((button) => {
    if (button.dataset.v335Bound === 'true') return;
    button.dataset.v335Bound = 'true';
    button.addEventListener('click', () => runAction(button.dataset.v335Action));
  });
}

function runAction(action) {
  const click = (id) => document.getElementById(id)?.click();
  if (action === 'duplicate') click('duplicate-layer-button');
  else if (action === 'delete') click('delete-layer-button');
  else if (action === 'pause') click('pause-button');
  else if (action === 'snapshot') click('snapshot-button');
  else if (action === 'grid') click('toggle-grid-button');
  else if (action === 'helpers') click('toggle-helpers-button');
  else if (action === 'zoom-out') click('zoom-out-button');
  else if (action === 'zoom-in') click('zoom-in-button');
  else if (action === 'zoom-reset') click('zoom-reset-button');
  else if (action === 'folder') click('view-local-button');
  else if (action === 'background') toggleWorkspaceBackground();
  else showSmallStatus('Reserved until full lower-panel controls are restored.');
  window.setTimeout(refreshLowerPanelReadouts, 30);
}

function toggleWorkspaceBackground() {
  const dark = document.querySelector('[data-workspace-mode="dark"]');
  const white = document.querySelector('[data-workspace-mode="white"]');
  const isWhite = document.body.dataset.v335Workspace === 'white';
  document.body.dataset.v335Workspace = isWhite ? 'dark' : 'white';
  (isWhite ? dark : white)?.click();
}

function setVersionLabel() {
  document.title = `Artifex Effect Editor ${VERSION_LABEL}`;
  const badge = document.getElementById('version-badge');
  if (badge) badge.textContent = VERSION_LABEL;
}

function injectStyles() {
  if (document.getElementById('v335-lower-panel-style')) return;
  const style = document.createElement('style');
  style.id = 'v335-lower-panel-style';
  style.textContent = `
    .workspace-toolbar #status-text { margin-left: auto; max-width: 360px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .lower-panel-grid-v335 { display: grid; grid-template-columns: minmax(330px, 1.5fr) minmax(230px, .78fr) minmax(310px, 1fr); gap: 14px; min-height: 100%; }
    .lower-panel-card-v335 { min-width: 0; border-left: 1px solid rgba(56,42,33,.75); padding-left: 14px; }
    .lower-panel-card-v335:first-child { border-left: 0; padding-left: 0; }
    .layer-toolbar-v335 { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 10px; }
    .layer-toolbar-v335 button, .display-icon-grid-v335 button, .zoom-strip-v335 button { min-width: 34px; min-height: 34px; padding: 4px 8px; border-radius: 13px; }
    .lower-panel-layers-v335 .layer-list { margin-top: 4px; }
    .display-icon-grid-v335 { display: grid; grid-template-columns: repeat(3, minmax(34px, 46px)); gap: 8px; align-items: center; justify-content: start; margin-top: 8px; }
    .zoom-strip-v335 { display: grid; grid-template-columns: 34px 58px 34px auto; gap: 8px; align-items: center; margin-top: 10px; }
    #zoom-readout-bottom-v335 { color: var(--gold-bright); text-align: center; font-weight: 800; }
    .lower-panel-diagnostics-v335 header { margin-bottom: 8px; }
    .diagnostic-readout-v335 { color: var(--module-accent-strong); font-family: 'Fira Code', monospace; font-size: 12px; line-height: 1.55; white-space: pre-wrap; }
    @media (max-width: 1100px) { .lower-panel-grid-v335 { grid-template-columns: 1fr; } }
  `;
  document.head.append(style);
}

function refreshLowerPanelReadouts() {
  setVersionLabel();
  const topZoom = document.getElementById('zoom-readout')?.textContent || '100%';
  const bottomZoom = document.getElementById('zoom-readout-bottom-v335');
  if (bottomZoom) bottomZoom.textContent = topZoom;

  const pauseTop = document.getElementById('pause-button')?.textContent || 'Pause';
  const pauseButton = document.getElementById('display-pause-v335');
  if (pauseButton) pauseButton.textContent = /resume/i.test(pauseTop) ? '▶' : '⏸';

  const displayState = document.getElementById('display-state-v335');
  if (displayState) displayState.textContent = /resume/i.test(pauseTop) ? 'Paused' : 'Running';

  const target = document.getElementById('emergency-diagnostics-v335');
  if (!target) return;
  const topStatus = document.getElementById('status-text')?.textContent || '';
  const layerCount = document.getElementById('layer-count')?.textContent || '0 layers';
  target.textContent = `${compact(topStatus)}\nLayers ${layerCount}\nZoom ${topZoom}\nEmergency shell · lower panel functional pass`;
}

function showSmallStatus(message) {
  const target = document.getElementById('emergency-diagnostics-v335');
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
