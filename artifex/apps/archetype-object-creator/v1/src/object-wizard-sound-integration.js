import { openSoundGeneratorModal } from '../../../../shared/sound-generator/sound-generator-window.js?v=0.1.0';

let soundIntegrationObserver = null;
let soundIntegrationQueued = false;

export function initObjectWizardSoundIntegration() {
  injectSoundIntegrationStyles();
  soundIntegrationObserver = new MutationObserver(scheduleRefresh);
  soundIntegrationObserver.observe(document.body, { childList: true, subtree: true });
  scheduleRefresh();
}

function injectSoundIntegrationStyles() {
  if (document.getElementById('object-wizard-sound-integration-styles')) return;
  const style = document.createElement('style');
  style.id = 'object-wizard-sound-integration-styles';
  style.textContent = `
    #quickstart-dialog .wizard-sound-list summary { display:flex; align-items:center; gap:7px; min-width:0; }
    #quickstart-dialog .wizard-sound-summary-label { flex:1; min-width:0; }
    #quickstart-dialog .wizard-create-sound-button { flex:none; display:inline-flex; align-items:center; justify-content:center; width:29px!important; min-width:29px!important; height:29px!important; min-height:29px!important; padding:0!important; border-radius:8px!important; font-size:14px!important; }
  `;
  document.head.appendChild(style);
}

function scheduleRefresh() {
  if (soundIntegrationQueued) return;
  soundIntegrationQueued = true;
  window.requestAnimationFrame(() => {
    soundIntegrationQueued = false;
    refreshSoundIntegration();
  });
}

function refreshSoundIntegration() {
  const panel = document.querySelector('#quickstart-dialog .wizard-build-detail-panel');
  if (!panel) return;
  updateSoundFields(panel);
  installCreateSoundButton(panel);
}

function updateSoundFields(panel) {
  const primary = panel.querySelector('[data-build="soundAssetId"]');
  if (primary) {
    primary.placeholder = 'asset_sfx_object_action';
    primary.title = 'Registered sound asset ID from assets/asset-index.json';
    replaceLabelText(primary.closest('label'), 'Primary Sound Asset ID');
  }
  panel.querySelectorAll('.wizard-sound-row [data-sound="path"]').forEach((input) => {
    input.placeholder = 'asset_sfx_object_action';
    input.title = 'Registered sound asset ID from assets/asset-index.json';
  });
}

function replaceLabelText(label, nextText) {
  if (!label) return;
  const node = Array.from(label.childNodes).find((item) => item.nodeType === Node.TEXT_NODE && item.textContent.trim());
  if (node && node.textContent.trim() !== nextText) node.textContent = nextText;
}

function installCreateSoundButton(panel) {
  const summary = panel.querySelector('.wizard-sound-list summary');
  if (!summary || summary.querySelector('.wizard-create-sound-button')) return;
  const existingText = summary.textContent.trim() || '🔊 Sound Events';
  summary.textContent = '';
  const label = document.createElement('span');
  label.className = 'wizard-sound-summary-label';
  label.textContent = existingText;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'wizard-create-sound-button';
  button.textContent = '🎛️';
  button.title = 'Create Synth Sound and assign its registered asset ID here';
  button.setAttribute('aria-label', 'Create Synth Sound');
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    openSoundGeneratorModal({
      sourceLabel: `Archetype Object Creator > ${humanize(selectedActionId())} > Sound Events`,
      onAssign: ({ assetId }) => assignGeneratedSound(panel, assetId)
    });
  });
  summary.append(label, button);
}

function assignGeneratedSound(panel, assetId) {
  const primary = panel.querySelector('[data-build="soundAssetId"]');
  if (!primary || !assetId) return;
  primary.value = assetId;
  primary.dispatchEvent(new Event('input', { bubbles: true }));
  primary.dispatchEvent(new Event('change', { bubbles: true }));
  const row = Array.from(panel.querySelectorAll('.wizard-sound-row [data-sound="path"]')).find((input) => !input.value.trim());
  if (row) {
    row.value = assetId;
    row.dispatchEvent(new Event('input', { bubbles: true }));
  }
  toast(`Assigned generated sound: ${assetId}`);
}

function selectedActionId() {
  const requirementId = document.querySelector('#quickstart-dialog .wizard-build-nav button.is-selected')?.dataset.requirementId || 'sound';
  return requirementId.split(':')[1] || requirementId;
}

function humanize(value) {
  return String(value || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function toast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message, type } }));
}
