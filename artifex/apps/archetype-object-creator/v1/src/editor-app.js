import { initObjectTemplateIcons } from './object-template-icons.js?v=1.25';
import './template-card-enhancements.js?v=1.14';
import './object-creator-workflows-stable.js?v=1.12';
import { initStep5ColumnLayout } from './object-wizard-step5-layout.js?v=1.22';
import { initObjectWizardStep5 } from './object-wizard-step5.js?v=1.29';
import { initObjectWizardReferencePanel } from './object-wizard-reference-panel.js?v=1.26';
import { initObjectWizardFrameCorrection } from './object-wizard-frame-correction.js?v=1.28';
import { initObjectWizardAssetPackage } from './object-wizard-asset-package.js?v=1.30';
import { initRenderer } from './editor-renderer.js';
import { initUI, showToast } from './editor-ui.js';
import { validateCurrentArchetype } from './editor-state.js';

const VERSION_LABEL = 'V1.30';

window.addEventListener('artifex:toast', (event) => {
  showToast(event.detail.message, event.detail.type);
});

window.addEventListener('DOMContentLoaded', () => {
  const versionBadge = document.getElementById('version-badge');
  if (versionBadge) versionBadge.textContent = VERSION_LABEL;

  validateCurrentArchetype();
  initRenderer();
  initUI();
  initObjectTemplateIcons();
  initStep5ColumnLayout();
  initObjectWizardStep5();
  initObjectWizardReferencePanel();
  initObjectWizardFrameCorrection();
  initObjectWizardAssetPackage();
  showToast(`Archetype Object Creator ${VERSION_LABEL} loaded.`, 'success');
});