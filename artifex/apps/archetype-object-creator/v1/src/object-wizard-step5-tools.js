import { openSoundGeneratorModal } from '../../../../shared/sound-generator/sound-generator-window.js?v=0.1.0';

let step5ToolsObserver = null;
let step5ToolsQueued = false;

export function initObjectWizardStep5Tools() {
  injectStep5ToolsStyles();
  startStep5ToolsObserver();
  scheduleStep5ToolsRefresh();
}

function injectStep5ToolsStyles() {
  if (document.getElementById('object-wizard-step5-tools-styles')) return;
  const style = document.createElement('style');
  style.id = 'object-wizard-step5-tools-styles';
  style.textContent = `
    #quickstart-dialog .wizard-build-actions {
      display: flex !important;
      flex-wrap: wrap !important;
      align-items: stretch !important;
      gap: 9px !important;
    }
    #quickstart-dialog .wizard-build-actions > button,
    #quickstart-dialog .wizard-build-actions > .button-like {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 188px !important;
      min-width: 188px !important;
      height: 40px !important;
      min-height: 40px !important;
      padding: 7px 12px !important;
      box-sizing: border-box !important;
      white-space: nowrap !important;
      font-size: 11px !important;
      line-height: 1.2 !important;
    }
    #quickstart-dialog .wizard-title-complete.wizard-task-ready-toggle {
      color: #fff0ce !important;
      border-color: rgba(126, 212, 150, .38) !important;
      background: rgba(72, 192, 113, .12) !important;
    }
    #quickstart-dialog .wizard-title-complete.wizard-task-ready-toggle span {
      font-size: 11px !important;
      font-weight: 700 !important;
      white-space: nowrap !important;
    }
    #quickstart-dialog .wizard-sound-list summary {
      display: flex !important;
      align-items: center !important;
      gap: 7px !important;
      min-width: 0 !important;
    }
    #quickstart-dialog .wizard-sound-summary-label { flex: 1; min-width: 0; }
    #quickstart-dialog .wizard-create-sound-button {
      flex: none !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 29px !important;
      min-width: 29px !important;
      height: 29px !important;
      min-height: 29px !important;
      padding: 0 !important;
      border-radius: 8px !important;
      font-size: 14px !important;
    }
    @media (max-width: 680px) {
      #quickstart-dialog .wizard-build-actions > button,
      #quickstart-dialog .wizard-build-actions > .button-like {
        width: 100% !important;
        min-width: 0 !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function startStep5ToolsObserver() {
  if (step5ToolsObserver) return;
  step5ToolsObserver = new MutationObserver(() => scheduleStep5ToolsRefresh());
  step5ToolsObserver.observe(document.body, { childList: true, subtree: true });
}

function scheduleStep5ToolsRefresh() {
  if (step5ToolsQueued) return;
  step5ToolsQueued = true;
  window.requestAnimationFrame(() => {
    step5ToolsQueued = false;
    refreshStep5Tools();
  });
}

function refreshStep5Tools() {
  const panel = document.querySelector('#quickstart-dialog .wizard-build-detail-panel');
  if (!panel) return;
  clarifyReadyToggle(panel);
  updateSoundAssetField(panel);
  installSoundCreatorButton(panel);
}

function clarifyReadyToggle(panel) {
  const label = panel.querySelector('[data-build="complete"]')?.closest('label');
  if (!label) return;
  label.classList.add('wizard-task-ready-toggle');
  label.title = 'Mark this selected task as ready. This does not finish or save the whole object.';
  const text = label.querySelector('span');
  if (text && text.textContent !== 'Mark Task Ready') text.textContent = 'Mark Task Ready';
}

function updateSoundAssetField(panel) {
  const input = panel.querySelector('[data-build="soundAssetId"]');
  if (input) {
    input.placeholder = 'asset_sfx_object_action';
    input.title = 'Registered sound asset ID from assets/asset-index.json';
    const label = input.closest('label');
    const textNode = label ? Array.from(label.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim()) : null;
    if (textNode) textNode.textContent = 'Primary Sound Asset ID';
  }
  panel.querySelectorAll('.wizard-sound-row [data-sound="path"]').forEach((field) => {
    field.placeholder = 'asset_sfx_object_action';
    field.title = 'Registered sound asset ID';
  });
}

function installSoundCreatorButton(panel) {
  const soundList = panel.querySelector('.wizard-sound-list');
  const summary = soundList?.querySelector('summary');
  if (!summary) return;
  if (!summary.querySelector('.wizard-sound-summary-label')) {
    summary.textContent = '';
    const label = document.createElement('span');
    label.className = 'wizard-sound-summary-label';
    label.textContent = '🔊 Sound Events';
    summary.appendChild(label);
  }
  if (summary.querySelector('.wizard-create-sound-button')) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'wizard-create-sound-button';
  button.textContent = '🎛️';
  button.title = 'Create Synth Sound and assign its project asset ID here';
  button.setAttribute('aria-label', 'Create Synth Sound');
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const requirementId = selectedRequirementId();
    openSoundGeneratorModal({
      sourceLabel: `Archetype Object Creator > ${humanize(actionIdFromRequirement(requirementId))} > Sound Events`,
      onAssign: ({ assetId }) => assignSoundAsset(panel, assetId)
    });
  });
  summary.appendChild(button);
}

function assignSoundAsset(panel, assetId) {
  const rows = panel.querySelector('.wizard-sound-rows');
  const primaryField = panel.querySelector('[data-build="soundAssetId"]');
  if (!rows || !primaryField || !assetId) return;
  let input = Array.from(rows.querySelectorAll('[data-sound="path"]')).find((field) => !field.value.trim());
  if (!input) {
    const addButton = panel.querySelector('.wizard-add-sound-button');
    addButton?.click();
    window.requestAnimationFrame(() => {
      input = Array.from(panel.querySelectorAll('.wizard-sound-row [data-sound="path"]')).find((field) => !field.value.trim());
      applyAssignedSound(input, primaryField, assetId);
    });
    return;
  }
  applyAssignedSound(input, primaryField, assetId);
}

function applyAssignedSound(input, primaryField, assetId) {
  if (!input) return;
  input.value = assetId;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  primaryField.value = assetId;
  primaryField.dispatchEvent(new Event('input', { bubbles: true }));
  toast(`Assigned generated sound: ${assetId}`, 'success');
}

function selectedRequirementId() {
  return document.querySelector('#quickstart-dialog .wizard-build-nav button.is-selected')?.dataset.requirementId || '';
}

function actionIdFromRequirement(requirementId) {
  return String(requirementId || '').split(':')[1] || 'sound';
}

function humanize(value) {
  return String(value || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function toast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message, type } }));
}
