import { initObjectWizardSessions } from './object-wizard-sessions.js?v=1.35';
import { createObjectWizardStart } from './object-wizard-start.js?v=1.35';
import { createObjectWizardCapabilities } from './object-wizard-capabilities.js?v=1.35';
import { createObjectWizardBasicDetails } from './object-wizard-basic-details.js?v=1.35';
import { createObjectWizardBuildChecklist } from './object-wizard-build-checklist.js?v=1.35';

const wizardState = {
  source: '',
  sessionId: '',
  selectedRequirementId: '',
  previewTimer: null,
  previewPlaying: false,
};

const routes = {};
let buildChecklist = null;

function closeMenus() {
  document.querySelectorAll('.menu-panel.open').forEach((panel) => panel.classList.remove('open'));
}

function installButtonSafety() {
  document.querySelectorAll('dialog button:not([type]):not([value])').forEach((button) => { button.type = 'button'; });
  document.addEventListener('click', (event) => {
    const close = event.target.closest('[data-close-dialog]');
    if (close) document.getElementById(close.dataset.closeDialog)?.close();
  });
}

function installWizard() {
  initObjectWizardSessions({ wizardState, renderBuildChecklist: () => routes.renderBuildChecklist() });
  installProgressOrb();
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('#quickstart-wizard-button, #clone-existing-button');
    if (!trigger) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    closeMenus();
    openWizard(trigger.id === 'clone-existing-button' ? 'existing' : '');
  }, true);
}

function installProgressOrb() {
  const header = document.querySelector('#quickstart-dialog .dialog-header');
  if (!header || document.getElementById('wizard-progress-orb')) return;
  const orb = document.createElement('div');
  orb.id = 'wizard-progress-orb';
  orb.className = 'wizard-progress-orb';
  orb.innerHTML = '<span>0%</span>';
  const closeButton = header.querySelector('[data-close-dialog], button[value="close"], button:last-child');
  header.insertBefore(orb, closeButton || null);
}

function content() { return document.getElementById('quickstart-content'); }

function setHeader(step) {
  const title = document.getElementById('quickstart-title');
  const label = document.getElementById('quickstart-step-label');
  if (title) title.textContent = 'Quick Start Wizard';
  if (label) label.textContent = step;
  buildChecklist?.updateProgressOrb();
}

function openWizard(source = '') {
  const dialog = document.getElementById('quickstart-dialog');
  if (!dialog) return;
  wizardState.source = source;
  wizardState.sessionId = `session_${Date.now().toString(36)}`;
  wizardState.selectedRequirementId = '';
  if (!dialog.open) dialog.showModal();
  source === 'existing' ? routes.renderExistingChoice() : routes.renderStartChoice();
}

function configureWizardRoutes() {
  buildChecklist = createObjectWizardBuildChecklist({
    wizardState,
    setHeader,
    content,
    renderBasicChanges: () => routes.renderBasicChanges(),
  });
  routes.renderBuildChecklist = buildChecklist.renderBuildChecklist;

  const basicDetails = createObjectWizardBasicDetails({
    setHeader,
    content,
    renderAbilityChoice: () => routes.renderAbilityChoice(),
    renderBuildChecklist: () => routes.renderBuildChecklist(),
  });
  routes.renderBasicChanges = basicDetails.renderBasicChanges;

  const capabilities = createObjectWizardCapabilities({
    wizardState,
    setHeader,
    content,
    renderTemplateChoice: () => routes.renderTemplateChoice(),
    renderExistingChoice: () => routes.renderExistingChoice(),
    renderBasicChanges: () => routes.renderBasicChanges(),
  });
  routes.renderAbilityChoice = capabilities.renderAbilityChoice;

  const start = createObjectWizardStart({
    wizardState,
    setHeader,
    content,
    renderAbilityChoice: () => routes.renderAbilityChoice(),
  });
  routes.renderStartChoice = start.renderStartChoice;
  routes.renderTemplateChoice = start.renderTemplateChoice;
  routes.renderExistingChoice = start.renderExistingChoice;
}

export function initObjectWizardFlow() {
  configureWizardRoutes();
  installButtonSafety();
  installWizard();
}
