const RIGHT_PANEL_LAYOUT_CSS = `
.object-creator-shell {
  display: grid !important;
  grid-template-columns: 300px 7px minmax(420px, 1fr) minmax(330px, 380px) !important;
  grid-template-rows: 1fr !important;
  min-width: 0 !important;
  min-height: 0 !important;
  overflow: hidden !important;
}

.compact-left-panel {
  width: auto !important;
  min-width: 0 !important;
  max-width: none !important;
  padding: 10px !important;
}

.compact-left-panel .card {
  margin-bottom: 10px !important;
  padding: 11px !important;
}

.compact-left-panel label {
  margin: 8px 0 !important;
}

.compact-left-panel input,
.compact-left-panel select {
  padding: 8px 9px !important;
}

.object-workspace-column {
  min-width: 0 !important;
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

.right-panel {
  min-width: 0 !important;
  min-height: 0 !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
  background: rgba(23, 18, 16, 0.96) !important;
  border-left: 1px solid var(--border) !important;
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.55) !important;
}

.right-panel-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 10px !important;
  min-height: 50px !important;
  padding: 12px 12px 8px !important;
  border-bottom: 1px solid rgba(56, 42, 33, 0.7) !important;
}

.right-panel-header h2 {
  margin: 0 !important;
  color: var(--gold-bright) !important;
  font-family: 'Cinzel', Georgia, serif !important;
  font-size: 13px !important;
  letter-spacing: 0.13em !important;
  text-transform: uppercase !important;
}

.right-panel-header #action-count {
  flex: 0 0 auto !important;
  color: var(--red-strong) !important;
  font-size: 11px !important;
  white-space: nowrap !important;
}

.right-tab-input {
  position: absolute !important;
  opacity: 0 !important;
  pointer-events: none !important;
  width: 1px !important;
  height: 1px !important;
}

.right-tabbar {
  display: flex !important;
  gap: 7px !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  padding: 9px 10px !important;
  border-bottom: 1px solid rgba(56, 42, 33, 0.72) !important;
  background: rgba(15, 12, 11, 0.74) !important;
  scrollbar-width: thin !important;
}

.right-tabbar label {
  flex: 0 0 auto !important;
  margin: 0 !important;
  padding: 8px 11px !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius-pill) !important;
  background: #100c0b !important;
  color: var(--gold) !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase !important;
  cursor: pointer !important;
  user-select: none !important;
  white-space: nowrap !important;
}

#right-tab-actions:checked ~ .right-tabbar label[for='right-tab-actions'],
#right-tab-portraits:checked ~ .right-tabbar label[for='right-tab-portraits'],
#right-tab-flags:checked ~ .right-tabbar label[for='right-tab-flags'],
#right-tab-validation:checked ~ .right-tabbar label[for='right-tab-validation'] {
  border-color: var(--red) !important;
  color: white !important;
  background: rgba(216, 69, 69, 0.20) !important;
  box-shadow: 0 0 14px rgba(216, 69, 69, 0.22) !important;
}

.right-panel-body {
  min-height: 0 !important;
  flex: 1 !important;
  overflow: auto !important;
  padding: 12px !important;
}

.right-tab-panel {
  display: none !important;
}

#right-tab-actions:checked ~ .right-panel-body [data-right-panel='actions'],
#right-tab-portraits:checked ~ .right-panel-body [data-right-panel='portraits'],
#right-tab-flags:checked ~ .right-panel-body [data-right-panel='flags'],
#right-tab-validation:checked ~ .right-panel-body [data-right-panel='validation'] {
  display: block !important;
}

.right-tab-panel h3 {
  margin: 0 0 7px !important;
  color: var(--gold-bright) !important;
  font-family: 'Cinzel', Georgia, serif !important;
  font-size: 12px !important;
  letter-spacing: 0.1em !important;
  text-transform: uppercase !important;
}

.vertical-chip-list {
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: 8px !important;
}

.vertical-chip-list .action-chip {
  width: 100% !important;
  text-align: left !important;
  justify-content: flex-start !important;
}

.right-panel .check-grid {
  gap: 8px !important;
}

.right-panel pre {
  max-height: none !important;
  min-height: 240px !important;
}

.bottom-resizer,
.bottom-panel {
  display: none !important;
}

@media (max-width: 1180px) {
  .object-creator-shell {
    grid-template-columns: 280px 7px minmax(360px, 1fr) 330px !important;
  }
}

@media (max-width: 980px) {
  .object-creator-shell {
    display: flex !important;
    flex-direction: column !important;
    overflow: auto !important;
    height: auto !important;
    min-height: calc(100vh - 116px) !important;
  }

  .compact-left-panel,
  .right-panel {
    width: 100% !important;
    max-width: none !important;
    min-height: auto !important;
    border-left: 0 !important;
    border-right: 0 !important;
  }

  .side-resizer {
    display: none !important;
  }

  .object-workspace-column {
    min-height: 420px !important;
  }

  .right-panel {
    min-height: 360px !important;
    border-top: 1px solid var(--border) !important;
  }
}
`;

function injectRightPanelLayout() {
  if (document.getElementById('object-creator-right-panel-layout-patch')) return;
  const style = document.createElement('style');
  style.id = 'object-creator-right-panel-layout-patch';
  style.textContent = RIGHT_PANEL_LAYOUT_CSS;
  document.head.appendChild(style);
}

function patchQuickstartButtons() {
  const dialog = document.getElementById('quickstart-dialog');
  if (!dialog) return;

  dialog.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (!button.hasAttribute('value')) {
      event.preventDefault();
    }
  }, true);
}

window.addEventListener('DOMContentLoaded', () => {
  injectRightPanelLayout();
  patchQuickstartButtons();
});
