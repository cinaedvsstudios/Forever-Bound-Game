import './template-card-enhancements.js?v=1.14';
import './object-creator-workflows-stable.js?v=1.12';
import { initRenderer } from './editor-renderer.js';
import { initUI, showToast } from './editor-ui.js';
import { validateCurrentArchetype } from './editor-state.js';

const VERSION_LABEL = 'V1.21';
let step5LayoutObserver = null;
let step5LayoutQueued = false;

window.addEventListener('artifex:toast', (event) => {
  showToast(event.detail.message, event.detail.type);
});

window.addEventListener('DOMContentLoaded', () => {
  const versionBadge = document.getElementById('version-badge');
  if (versionBadge) versionBadge.textContent = VERSION_LABEL;

  injectStep5ColumnStyles();
  validateCurrentArchetype();
  initRenderer();
  initUI();
  startStep5LayoutObserver();
  scheduleStep5Layout();
  showToast(`Archetype Object Creator ${VERSION_LABEL} loaded.`, 'success');
});

function injectStep5ColumnStyles() {
  if (document.getElementById('object-creator-step5-column-layout')) return;
  const style = document.createElement('style');
  style.id = 'object-creator-step5-column-layout';
  style.textContent = `
    #quickstart-dialog .wizard-build-detail-panel {
      display: grid !important;
      grid-template-columns: minmax(360px, 0.78fr) minmax(520px, 1.22fr) !important;
      grid-auto-rows: min-content !important;
      align-items: start !important;
      align-content: start !important;
      column-gap: 16px !important;
      row-gap: 10px !important;
      overflow: visible !important;
    }

    #quickstart-dialog .wizard-step5-left,
    #quickstart-dialog .wizard-step5-right {
      display: grid !important;
      grid-template-columns: 1fr !important;
      align-content: start !important;
      gap: 8px !important;
      min-width: 0 !important;
      margin: 0 !important;
    }

    #quickstart-dialog .wizard-step5-left {
      grid-column: 1 !important;
      grid-row: 1 !important;
    }

    #quickstart-dialog .wizard-step5-right {
      grid-column: 2 !important;
      grid-row: 1 !important;
    }

    #quickstart-dialog .wizard-step5-right > h3,
    #quickstart-dialog .wizard-step5-right > .wizard-build-title {
      grid-column: 1 !important;
      grid-row: auto !important;
      margin: 0 0 4px !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      min-width: 0 !important;
    }

    #quickstart-dialog .wizard-step5-right .wizard-right-stack {
      grid-column: 1 !important;
      grid-row: auto !important;
      margin: 0 !important;
      gap: 8px !important;
      align-self: start !important;
    }

    #quickstart-dialog .wizard-step5-left .wizard-preview-stage,
    #quickstart-dialog .wizard-step5-left [data-preview-stage] {
      grid-column: 1 !important;
      grid-row: auto !important;
      width: 100% !important;
      max-width: none !important;
      height: clamp(250px, 34vh, 330px) !important;
      min-height: 250px !important;
      max-height: 330px !important;
      margin: 0 !important;
      align-self: start !important;
    }

    #quickstart-dialog .wizard-step5-left .wizard-preview-controls {
      grid-column: 1 !important;
      grid-row: auto !important;
      display: flex !important;
      flex-wrap: wrap !important;
      align-items: center !important;
      gap: 8px !important;
      margin: 2px 0 0 !important;
      position: relative !important;
    }

    #quickstart-dialog .wizard-step5-left .wizard-preview-controls button,
    #quickstart-dialog .wizard-step5-left .wizard-frame-correct-button {
      min-height: 31px !important;
      padding: 5px 10px !important;
      font-size: 12px !important;
    }

    #quickstart-dialog .wizard-step5-left .wizard-reference-panel {
      grid-column: 1 !important;
      grid-row: auto !important;
      margin: 2px 0 0 !important;
      padding-top: 8px !important;
      border-top: 1px solid rgba(226, 204, 167, 0.18) !important;
    }

    #quickstart-dialog .wizard-step5-left .wizard-reference-panel h4 {
      margin: 0 0 5px !important;
    }

    #quickstart-dialog .wizard-step5-left .wizard-reference-scroll {
      height: 92px !important;
      min-height: 92px !important;
      max-height: 92px !important;
      overflow: auto !important;
    }

    #quickstart-dialog .wizard-build-detail-panel > .wizard-frame-strip {
      grid-column: 1 / -1 !important;
      grid-row: auto !important;
      margin-top: 2px !important;
    }

    #quickstart-dialog .wizard-build-detail-panel > .wizard-build-actions {
      grid-column: 1 / -1 !important;
      grid-row: auto !important;
      margin-top: 0 !important;
    }

    #quickstart-dialog .wizard-build-detail-panel > .wizard-frame-file-table-wrap {
      grid-column: 1 / -1 !important;
      grid-row: auto !important;
    }

    @media (max-width: 1100px) {
      #quickstart-dialog .wizard-build-detail-panel {
        grid-template-columns: 1fr !important;
      }

      #quickstart-dialog .wizard-step5-left,
      #quickstart-dialog .wizard-step5-right,
      #quickstart-dialog .wizard-build-detail-panel > .wizard-frame-strip,
      #quickstart-dialog .wizard-build-detail-panel > .wizard-build-actions,
      #quickstart-dialog .wizard-build-detail-panel > .wizard-frame-file-table-wrap {
        grid-column: 1 !important;
        grid-row: auto !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function startStep5LayoutObserver() {
  if (step5LayoutObserver) return;
  step5LayoutObserver = new MutationObserver(() => scheduleStep5Layout());
  step5LayoutObserver.observe(document.body, { childList: true, subtree: true });
}

function scheduleStep5Layout() {
  if (step5LayoutQueued) return;
  step5LayoutQueued = true;
  window.requestAnimationFrame(() => {
    step5LayoutQueued = false;
    applyStep5ColumnLayout();
  });
}

function applyStep5ColumnLayout() {
  const panel = document.querySelector('#quickstart-dialog .wizard-build-detail-panel');
  if (!panel) return;

  let left = panel.querySelector(':scope > .wizard-step5-left');
  if (!left) {
    left = document.createElement('section');
    left.className = 'wizard-step5-left';
    panel.prepend(left);
  }

  let right = panel.querySelector(':scope > .wizard-step5-right');
  if (!right) {
    right = document.createElement('section');
    right.className = 'wizard-step5-right';
    left.after(right);
  }

  const preview = panel.querySelector(':scope > .wizard-preview-stage, :scope > [data-preview-stage]');
  if (preview && preview.parentElement !== left) left.appendChild(preview);

  const controls = panel.querySelector(':scope > .wizard-preview-controls');
  if (controls && controls.parentElement !== left) left.appendChild(controls);

  const reference = panel.querySelector(':scope > .wizard-reference-panel');
  if (reference && reference.parentElement !== left) left.appendChild(reference);

  const title = panel.querySelector(':scope > h3');
  if (title && title.parentElement !== right) right.prepend(title);

  const info = panel.querySelector(':scope > .wizard-action-info-text');
  if (info && info.parentElement !== right) {
    const titleInRight = right.querySelector('h3');
    if (titleInRight) titleInRight.after(info);
    else right.prepend(info);
  }

  const rightStack = panel.querySelector(':scope > .wizard-right-stack');
  if (rightStack && rightStack.parentElement !== right) right.appendChild(rightStack);
}
