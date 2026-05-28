const VERSION_LABEL = 'V3.33-emergency';

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
    <div class="lower-panel-clean-v333">
      <section class="lower-panel-section-v333 lower-panel-layers-v333">
        <header><h2>Layers</h2><span id="layer-count">${escapeHtml(currentCount)}</span></header>
        <div id="layer-list" class="layer-list">${currentLayers}</div>
      </section>
      <section class="lower-panel-section-v333">
        <header><h2>Display</h2><span>Emergency</span></header>
        <p class="lower-panel-note-v333">Preview controls remain in the top toolbar while the full display strip is being restored.</p>
      </section>
      <section class="lower-panel-section-v333">
        <header><h2>Diagnostics</h2></header>
        <div id="emergency-diagnostics-v333" class="diagnostic-readout-v333">Emergency shell active.</div>
      </section>
    </div>
  `;
  updateDiagnostics();
}

function setVersionLabel() {
  document.title = `Artifex Effect Editor ${VERSION_LABEL}`;
  const badge = document.getElementById('version-badge');
  if (badge) badge.textContent = VERSION_LABEL;
}

function injectStyles() {
  if (document.getElementById('v333-lower-panel-cleanup-style')) return;
  const style = document.createElement('style');
  style.id = 'v333-lower-panel-cleanup-style';
  style.textContent = `
    .lower-panel-clean-v333 { display: grid; grid-template-columns: minmax(280px, 1.45fr) minmax(220px, .8fr) minmax(260px, 1fr); gap: 14px; min-height: 100%; }
    .lower-panel-section-v333 { min-width: 0; border-left: 1px solid rgba(56,42,33,.75); padding-left: 14px; }
    .lower-panel-section-v333:first-child { border-left: 0; padding-left: 0; }
    .lower-panel-layers-v333 .layer-list { margin-top: 10px; }
    .lower-panel-note-v333 { color: var(--gold-muted); font-size: 11px; line-height: 1.45; margin: 10px 0 0; max-width: 340px; }
    .diagnostic-readout-v333 { color: var(--module-accent-strong); font-family: 'Fira Code', monospace; line-height: 1.55; white-space: pre-wrap; }
    @media (max-width: 1100px) { .lower-panel-clean-v333 { grid-template-columns: 1fr; } }
  `;
  document.head.append(style);
}

function updateDiagnostics() {
  const target = document.getElementById('emergency-diagnostics-v333');
  if (!target) return;
  target.textContent = 'Starts paused for safety. Use the top Pause/Resume control to run the preview.';
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
