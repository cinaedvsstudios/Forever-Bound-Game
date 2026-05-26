import {
  editorState,
  applyRoleTemplate,
  loadArchetype,
  updateIdentity,
  updateArchetype,
  updateFlag,
  toggleGameplayAction,
  togglePortraitAction,
  validateCurrentArchetype
} from './editor-state.js';
import {
  GAMEPLAY_ACTIONS,
  OBJECT_TEMPLATE_IDS,
  PEOPLE_TEMPLATE_IDS,
  PORTRAIT_ACTIONS,
  ROLE_TEMPLATES,
  RUNTIME_FLAGS
} from './templates.js';
import { listLocalArchetypes, saveCurrentLocal } from './editor-io.js';

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

const wizardState = {
  source: '',
  selectedRole: ''
};

function injectRightPanelLayout() {
  if (document.getElementById('object-creator-right-panel-layout-patch')) return;
  const style = document.createElement('style');
  style.id = 'object-creator-right-panel-layout-patch';
  style.textContent = RIGHT_PANEL_LAYOUT_CSS;
  document.head.appendChild(style);
}

function installButtonSafety() {
  const fixButtons = () => {
    document.querySelectorAll('dialog button:not([type]):not([value])').forEach((button) => {
      button.type = 'button';
    });
  };
  fixButtons();
  new MutationObserver(fixButtons).observe(document.body, { childList: true, subtree: true });
}

function installWizardOverride() {
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('#quickstart-wizard-button, #clone-existing-button');
    if (!trigger) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openPatchedWizard(trigger.id === 'clone-existing-button' ? 'existing' : '');
  }, true);
}

function openPatchedWizard(forcedSource = '') {
  const dialog = document.getElementById('quickstart-dialog');
  if (!dialog) return;
  wizardState.source = '';
  wizardState.selectedRole = editorState.archetype.role || 'person_npc_basic';
  if (!dialog.open) dialog.showModal();
  if (forcedSource === 'existing') renderExistingChoice();
  else renderStartChoice();
}

function setWizardHeader(title, step) {
  const titleElement = document.getElementById('quickstart-title');
  const stepElement = document.getElementById('quickstart-step-label');
  if (titleElement) titleElement.textContent = title;
  if (stepElement) stepElement.textContent = step;
}

function getWizardContent() {
  return document.getElementById('quickstart-content');
}

function renderStartChoice() {
  setWizardHeader('Quick Start Wizard', 'Step 1: choose a starting point');
  const content = getWizardContent();
  if (!content) return;
  content.innerHTML = `
    <div class="wizard-choice-grid">
      <button type="button" class="wizard-choice" data-patched-source="template">
        <strong>Template</strong>
        <span>Start from a standard object type with default actions, flags, size, collision, and preview icon.</span>
      </button>
      <button type="button" class="wizard-choice" data-patched-source="existing">
        <strong>Existing Object</strong>
        <span>Copy an object already saved in the Archetype Object Library, then make a new version from it.</span>
      </button>
    </div>
  `;
  content.querySelector('[data-patched-source="template"]')?.addEventListener('click', renderTemplateChoice);
  content.querySelector('[data-patched-source="existing"]')?.addEventListener('click', renderExistingChoice);
}

function renderTemplateChoice() {
  wizardState.source = 'template';
  setWizardHeader('Quick Start Wizard', 'Step 2: what type of object is this?');
  const content = getWizardContent();
  if (!content) return;
  content.innerHTML = `
    <p class="hint">Choose the closest starter. You can adjust actions, flags, IDs, and asset links on the next screens.</p>
    <div class="wizard-toolbar"><button type="button" data-patched-back>Back</button></div>
    <div class="template-card-grid wizard-template-grid"></div>
  `;
  content.querySelector('[data-patched-back]')?.addEventListener('click', renderStartChoice);
  const grid = content.querySelector('.wizard-template-grid');
  for (const roleId of getAllTemplateIds()) grid.appendChild(createPatchedTemplateCard(roleId));
}

function renderExistingChoice() {
  wizardState.source = 'existing';
  setWizardHeader('Quick Start Wizard', 'Step 2: choose an existing object to copy');
  const content = getWizardContent();
  if (!content) return;
  const saved = listLocalArchetypes();
  content.innerHTML = `
    <p class="hint">This does not overwrite the original. It loads a copied version with a new ID so it can become a new archetype.</p>
    <div class="wizard-toolbar"><button type="button" data-patched-back>Back</button></div>
    <div class="template-card-grid wizard-existing-grid"></div>
  `;
  content.querySelector('[data-patched-back]')?.addEventListener('click', renderStartChoice);
  const grid = content.querySelector('.wizard-existing-grid');
  if (!saved.length) {
    grid.innerHTML = '<p class="hint">No existing local objects found yet. Save an archetype locally first, or go back and start from a template.</p>';
    return;
  }
  for (const item of saved) grid.appendChild(createPatchedExistingCard(item));
}

function createPatchedTemplateCard(roleId) {
  const template = ROLE_TEMPLATES[roleId];
  const card = document.createElement('article');
  card.className = 'template-card';
  card.dataset.templateId = roleId;
  card.innerHTML = `
    <div class="template-card-body">
      <h4>${escapeHtml(template.label)}</h4>
      <p>${escapeHtml(template.category)} · ${template.gameplayActions.length} gameplay actions</p>
    </div>
  `;
  const use = document.createElement('button');
  use.type = 'button';
  use.textContent = 'Choose Template';
  use.addEventListener('click', () => {
    applyRoleTemplate(roleId);
    wizardState.selectedRole = roleId;
    renderAbilityChoice();
  });
  card.appendChild(use);
  return card;
}

function createPatchedExistingCard(item) {
  const data = item.data || {};
  const roleId = ROLE_TEMPLATES[data.role] ? data.role : 'static_prop';
  const card = document.createElement('article');
  card.className = 'template-card';
  card.dataset.templateId = roleId;
  card.innerHTML = `
    <div class="template-card-body">
      <h4>${escapeHtml(data.name || data.id || 'Unnamed Object')}</h4>
      <p>${escapeHtml(data.category || 'unknown')} · ${escapeHtml(data.role || 'no role')}</p>
    </div>
  `;
  const choose = document.createElement('button');
  choose.type = 'button';
  choose.textContent = 'Copy This Object';
  choose.addEventListener('click', () => {
    loadArchetype(cloneAsNewArchetype(data));
    renderAbilityChoice();
  });
  card.appendChild(choose);
  return card;
}

function renderAbilityChoice() {
  setWizardHeader('Quick Start Wizard', 'Step 3: what should it be able to do?');
  const content = getWizardContent();
  if (!content) return;
  const item = editorState.archetype;
  content.innerHTML = `
    <p class="hint">These choices control runtime behaviour and animation expectations. Talk is intentionally not a body sprite action.</p>
    <div class="wizard-toolbar">
      <button type="button" data-patched-back>Back</button>
      <button type="button" data-patched-next>Next: basic changes</button>
    </div>
    <div class="wizard-columns">
      <section><h3>Runtime Flags</h3><div class="wizard-checks" data-patched-flags></div></section>
      <section><h3>Gameplay Sprite Actions</h3><div class="wizard-checks" data-patched-gameplay></div></section>
      <section><h3>Dialogue Portrait Actions</h3><div class="wizard-checks" data-patched-portrait></div></section>
    </div>
  `;
  content.querySelector('[data-patched-back]')?.addEventListener('click', () => {
    if (wizardState.source === 'existing') renderExistingChoice();
    else renderTemplateChoice();
  });
  content.querySelector('[data-patched-next]')?.addEventListener('click', renderBasicChanges);
  renderFlagChecks(content.querySelector('[data-patched-flags]'), item);
  renderActionChecks(content.querySelector('[data-patched-gameplay]'), GAMEPLAY_ACTIONS, item.animationProfile.gameplayActions, 'gameplay');
  renderActionChecks(content.querySelector('[data-patched-portrait]'), PORTRAIT_ACTIONS, item.animationProfile.portraitActions, 'portrait');
}

function renderFlagChecks(container, item) {
  if (!container) return;
  container.innerHTML = '';
  for (const flag of RUNTIME_FLAGS) {
    const row = document.createElement('label');
    row.className = 'wizard-check-row';
    row.innerHTML = `<span>${escapeHtml(flag.label)}</span><input type="checkbox" ${item.behaviour.flags[flag.key] ? 'checked' : ''} />`;
    row.querySelector('input').addEventListener('change', (event) => updateFlag(flag.key, event.target.checked));
    container.appendChild(row);
  }
}

function renderActionChecks(container, actions, selected, type) {
  if (!container) return;
  container.innerHTML = '';
  const selectedSet = new Set(selected);
  for (const action of actions) {
    const row = document.createElement('label');
    row.className = 'wizard-check-row';
    row.innerHTML = `<span>${escapeHtml(action.label)}</span><input type="checkbox" ${selectedSet.has(action.id) ? 'checked' : ''} />`;
    row.querySelector('input').addEventListener('change', () => {
      if (type === 'gameplay') toggleGameplayAction(action.id);
      else togglePortraitAction(action.id);
    });
    container.appendChild(row);
  }
}

function renderBasicChanges() {
  setWizardHeader('Quick Start Wizard', 'Step 4: make the basic changes');
  const content = getWizardContent();
  if (!content) return;
  const item = editorState.archetype;
  content.innerHTML = `
    <p class="hint">This is the fast edit screen for making the copied/template object become its own new archetype.</p>
    <div class="wizard-toolbar">
      <button type="button" data-patched-back>Back</button>
      <button type="button" data-patched-save>Finish + Save Local</button>
      <button type="button" data-patched-finish>Finish</button>
    </div>
    <div class="wizard-form-grid">
      <label>Archetype ID<input data-patched-field="id" value="${escapeHtml(item.id)}" /></label>
      <label>Name<input data-patched-field="name" value="${escapeHtml(item.name)}" /></label>
      <label>Subtype<input data-patched-field="subtype" value="${escapeHtml(item.subtype)}" /></label>
      <label>Tags<input data-patched-field="tags" value="${escapeHtml(item.tags.join(', '))}" /></label>
      <label>Gameplay Sprite Asset ID<input data-patched-field="spriteAssetId" value="${escapeHtml(item.visual.spriteAssetId)}" /></label>
      <label>Dialogue Portrait Asset ID<input data-patched-field="portraitAssetId" value="${escapeHtml(item.visual.portraitAssetId)}" /></label>
    </div>
  `;
  content.querySelector('[data-patched-back]')?.addEventListener('click', renderAbilityChoice);
  content.querySelector('[data-patched-save]')?.addEventListener('click', () => finishPatchedWizard(true));
  content.querySelector('[data-patched-finish]')?.addEventListener('click', () => finishPatchedWizard(false));
  content.querySelectorAll('[data-patched-field]').forEach((input) => {
    input.addEventListener('input', () => updateBasicField(input.dataset.patchedField, input.value));
  });
}

function updateBasicField(field, value) {
  if (field === 'id') updateIdentity({ id: value });
  if (field === 'name') updateIdentity({ name: value });
  if (field === 'subtype') updateIdentity({ subtype: value });
  if (field === 'tags') updateIdentity({ tags: value });
  if (field === 'spriteAssetId') updateArchetype({ visual: { spriteAssetId: value } });
  if (field === 'portraitAssetId') updateArchetype({ visual: { portraitAssetId: value } });
}

function finishPatchedWizard(shouldSave) {
  validateCurrentArchetype();
  if (shouldSave) saveCurrentLocal();
  document.getElementById('quickstart-dialog')?.close();
  window.dispatchEvent(new CustomEvent('artifex:toast', {
    detail: { message: shouldSave ? 'Quick Start complete and saved locally.' : 'Quick Start complete.', type: 'success' }
  }));
}

function getAllTemplateIds() {
  return [...PEOPLE_TEMPLATE_IDS, ...OBJECT_TEMPLATE_IDS];
}

function cloneAsNewArchetype(data) {
  const clone = JSON.parse(JSON.stringify(data || {}));
  const baseId = safeId(clone.id || clone.name || 'object_archetype');
  const suffix = Date.now().toString(36).slice(-5);
  clone.id = `${baseId}_variant_${suffix}`;
  clone.name = `${clone.name || clone.id || 'Object Archetype'} Variant`;
  clone.createdAt = new Date().toISOString();
  clone.updatedAt = new Date().toISOString();
  return clone;
}

function safeId(value) {
  return String(value || 'object_archetype').trim().toLowerCase().replace(/[^a-z0-9_\-]+/g, '_').replace(/^_+|_+$/g, '') || 'object_archetype';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

window.addEventListener('DOMContentLoaded', () => {
  injectRightPanelLayout();
  installButtonSafety();
  installWizardOverride();
});
