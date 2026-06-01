import { initObjectTemplateIcons } from './object-template-icons.js?v=1.25';
import { initObjectWizardFlow } from './object-wizard-flow.js?v=1.36';
import { initObjectWizardStep5 } from './object-wizard-step5.js?v=1.36';
import { initObjectWizardReferencePanel } from './object-wizard-reference-panel.js?v=1.36';
import { initObjectWizardAssetPackage } from './object-wizard-asset-package.js?v=1.36';
import { initObjectProjectStorage } from './object-project-storage.js?v=1.36';
import { initRenderer } from './editor-renderer.js';
import { initUI, showToast } from './editor-ui.js';
import { validateCurrentArchetype } from './editor-state.js';

const VERSION_LABEL = 'V1.36';

window.addEventListener('artifex:toast', (event) => {
  showToast(event.detail.message, event.detail.type);
});

window.addEventListener('DOMContentLoaded', () => {
  const versionBadge = document.getElementById('version-badge');
  if (versionBadge) versionBadge.textContent = VERSION_LABEL;

  validateCurrentArchetype();
  initRenderer();
  initUI();
  initObjectProjectStorage();
  initObjectTemplateIcons();
  initObjectWizardFlow();
  initObjectWizardStep5();
  initObjectWizardReferencePanel();
  initObjectWizardAssetPackage();
  showToast(`Archetype Object Creator ${VERSION_LABEL} loaded.`, 'success');
});