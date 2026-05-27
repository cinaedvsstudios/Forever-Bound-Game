import { editorState } from './editor-state.js';

let referenceObserver = null;
let referenceQueued = false;

export function initObjectWizardReferencePanel() {
  injectReferenceStyles();
  startReferenceObserver();
  scheduleReferenceRefresh();
}

function injectReferenceStyles() {
  if (document.getElementById('object-wizard-reference-panel-styles')) return;
  const style = document.createElement('style');
  style.id = 'object-wizard-reference-panel-styles';
  style.textContent = `
    #quickstart-dialog .wizard-reference-panel {
      border-top: 1px solid rgba(226, 204, 167, 0.18);
      padding-top: 8px;
    }

    #quickstart-dialog .wizard-reference-panel h4 {
      margin: 0 0 5px;
      color: #e2cca7;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }

    #quickstart-dialog .wizard-reference-scroll {
      height: 92px;
      min-height: 92px;
      max-height: 92px;
      overflow: auto;
      border: 1px solid rgba(226, 204, 167, 0.18);
      border-radius: 14px;
      background: rgba(0, 0, 0, 0.16);
      padding: 8px;
      color: rgba(255, 240, 206, 0.74);
      font-size: 11px;
      line-height: 1.35;
    }

    #quickstart-dialog .wizard-reference-scroll ul {
      margin: 0;
      padding-left: 16px;
    }

    #quickstart-dialog .wizard-reference-scroll li {
      margin: 0 0 5px;
    }

    #quickstart-dialog .wizard-reference-scroll code {
      color: #fff0ce;
      word-break: break-word;
    }

    #quickstart-dialog .wizard-reference-empty {
      color: rgba(255, 240, 206, 0.54);
    }
  `;
  document.head.appendChild(style);
}

function startReferenceObserver() {
  if (referenceObserver) return;
  referenceObserver = new MutationObserver(() => scheduleReferenceRefresh());
  referenceObserver.observe(document.body, { childList: true, subtree: true });
}

function scheduleReferenceRefresh() {
  if (referenceQueued) return;
  referenceQueued = true;
  window.requestAnimationFrame(() => {
    referenceQueued = false;
    refreshReferencePanel();
  });
}

function refreshReferencePanel() {
  const panel = document.querySelector('#quickstart-dialog .wizard-build-detail-panel');
  const controls = document.querySelector('#quickstart-dialog .wizard-preview-controls');
  if (!panel || !controls) return;

  let reference = panel.querySelector('.wizard-reference-panel');
  if (!reference) {
    reference = document.createElement('section');
    reference.className = 'wizard-reference-panel';
    reference.innerHTML = '<h4>Reference</h4><div class="wizard-reference-scroll"></div>';
    controls.after(reference);
  }

  const selectedId = selectedRequirementId();
  const box = reference.querySelector('.wizard-reference-scroll');
  if (box) box.innerHTML = renderReferenceList(selectedId);
}

function selectedRequirementId() {
  return document.querySelector('#quickstart-dialog .wizard-build-nav button.is-selected')?.dataset.requirementId || '';
}

function renderReferenceList(requirementId) {
  const refs = findProjectReferences(requirementId);
  if (!refs.indexAvailable) {
    return '<p class="wizard-reference-empty">No project reference index is loaded yet. This panel is ready for <code>projects/&lt;project-id&gt;/reference-index.json</code> once Project Manager / Health Guide generates it.</p>';
  }

  if (!refs.items.length) {
    return '<p class="wizard-reference-empty">No scene, quest, route, object, or FX references found for this action in the loaded index.</p>';
  }

  return `<ul>${refs.items.map((item) => `<li><strong>${escapeHtml(item.type || 'reference')}</strong>: <code>${escapeHtml(item.file || item.path || item.id || '')}</code>${item.label ? ` — ${escapeHtml(item.label)}` : ''}</li>`).join('')}</ul>`;
}

function findProjectReferences(requirementId) {
  const index = editorState.projectReferenceIndex || editorState.referenceIndex || window.artifexReferenceIndex || readReferenceIndexFromLocalStorage();
  if (!index) return { indexAvailable: false, items: [] };

  const actionId = actionIdFromRequirement(requirementId);
  const objectId = editorState.archetype?.id || '';
  const all = Array.isArray(index.references) ? index.references : Array.isArray(index.items) ? index.items : [];
  const items = all.filter((item) => {
    const haystack = JSON.stringify(item).toLowerCase();
    return (objectId && haystack.includes(objectId.toLowerCase())) || (actionId && haystack.includes(actionId.toLowerCase())) || haystack.includes(String(requirementId || '').toLowerCase());
  });

  return { indexAvailable: true, items };
}

function readReferenceIndexFromLocalStorage() {
  try {
    const raw = localStorage.getItem('artifex.referenceIndex') || localStorage.getItem('artifex.projectReferenceIndex');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function actionIdFromRequirement(requirementId) {
  return String(requirementId || '').split(':')[1] || String(requirementId || 'asset');
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
}
