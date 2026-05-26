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

const VERSION = '1.07';

const WORKFLOW_CSS = `
.object-creator-shell { display:grid !important; grid-template-columns:300px 7px minmax(420px,1fr) minmax(330px,380px) !important; grid-template-rows:1fr !important; min-width:0 !important; min-height:0 !important; overflow:hidden !important; }
.compact-left-panel { width:auto !important; min-width:0 !important; max-width:none !important; padding:10px !important; }
.compact-left-panel .card { margin-bottom:10px !important; padding:11px !important; }
.compact-left-panel label { margin:8px 0 !important; }
.compact-left-panel input,.compact-left-panel select { padding:8px 9px !important; }
.object-workspace-column { min-width:0 !important; min-height:0 !important; display:flex !important; flex-direction:column !important; overflow:hidden !important; }
.right-panel { min-width:0 !important; min-height:0 !important; overflow:hidden !important; display:flex !important; flex-direction:column !important; background:rgba(23,18,16,.96) !important; border-left:1px solid var(--border) !important; box-shadow:-8px 0 24px rgba(0,0,0,.55) !important; }
.right-panel-header { display:flex !important; align-items:center !important; justify-content:space-between !important; gap:10px !important; min-height:50px !important; padding:12px 12px 8px !important; border-bottom:1px solid rgba(56,42,33,.7) !important; }
.right-panel-header h2 { margin:0 !important; color:var(--gold-bright) !important; font-family:'Cinzel',Georgia,serif !important; font-size:13px !important; letter-spacing:.13em !important; text-transform:uppercase !important; }
.right-panel-header #action-count { flex:0 0 auto !important; color:var(--red-strong) !important; font-size:11px !important; white-space:nowrap !important; }
.right-tab-input { position:absolute !important; opacity:0 !important; pointer-events:none !important; width:1px !important; height:1px !important; }
.right-tabbar { display:flex !important; gap:7px !important; overflow-x:auto !important; overflow-y:hidden !important; padding:9px 10px !important; border-bottom:1px solid rgba(56,42,33,.72) !important; background:rgba(15,12,11,.74) !important; scrollbar-width:thin !important; }
.right-tabbar label { flex:0 0 auto !important; margin:0 !important; padding:8px 11px !important; border:1px solid var(--border) !important; border-radius:var(--radius-pill) !important; background:#100c0b !important; color:var(--gold) !important; font-size:11px !important; font-weight:800 !important; letter-spacing:.08em !important; text-transform:uppercase !important; cursor:pointer !important; user-select:none !important; white-space:nowrap !important; }
#right-tab-actions:checked ~ .right-tabbar label[for='right-tab-actions'],#right-tab-portraits:checked ~ .right-tabbar label[for='right-tab-portraits'],#right-tab-flags:checked ~ .right-tabbar label[for='right-tab-flags'],#right-tab-validation:checked ~ .right-tabbar label[for='right-tab-validation'] { border-color:var(--red) !important; color:white !important; background:rgba(216,69,69,.20) !important; box-shadow:0 0 14px rgba(216,69,69,.22) !important; }
.right-panel-body { min-height:0 !important; flex:1 !important; overflow:auto !important; padding:12px !important; }
.right-tab-panel { display:none !important; }
#right-tab-actions:checked ~ .right-panel-body [data-right-panel='actions'],#right-tab-portraits:checked ~ .right-panel-body [data-right-panel='portraits'],#right-tab-flags:checked ~ .right-panel-body [data-right-panel='flags'],#right-tab-validation:checked ~ .right-panel-body [data-right-panel='validation'] { display:block !important; }
.vertical-chip-list { display:grid !important; grid-template-columns:1fr !important; gap:8px !important; }
.vertical-chip-list .action-chip { width:100% !important; text-align:left !important; justify-content:flex-start !important; }
.bottom-resizer,.bottom-panel { display:none !important; }
.wizard-build-list { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:12px; margin-top:14px; }
.wizard-build-item { border:1px solid rgba(226,204,167,.28); border-radius:16px; background:rgba(18,13,11,.82); overflow:hidden; }
.wizard-build-summary { width:100%; display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px 13px; border:0; border-bottom:1px solid rgba(226,204,167,.16); background:rgba(38,27,22,.9); color:#fff0ce; text-align:left; cursor:pointer; }
.wizard-build-summary strong { display:block; font-size:14px; }
.wizard-build-summary span span { display:block; color:rgba(255,240,206,.68); font-size:11px; margin-top:2px; }
.wizard-build-summary em { flex:0 0 auto; color:#ff7878; font-style:normal; font-size:11px; letter-spacing:.08em; text-transform:uppercase; }
.wizard-build-item.is-complete .wizard-build-summary em { color:#b8d56e; }
.wizard-build-detail { display:none; padding:12px; }
.wizard-build-item.is-open .wizard-build-detail { display:grid; gap:10px; }
.wizard-build-detail label { display:grid; gap:5px; margin:0; }
.wizard-build-detail input,.wizard-build-detail select,.wizard-build-detail textarea { width:100%; }
.wizard-build-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
@media (max-width:980px) { .object-creator-shell { display:flex !important; flex-direction:column !important; overflow:auto !important; height:auto !important; min-height:calc(100vh - 116px) !important; } .compact-left-panel,.right-panel { width:100% !important; max-width:none !important; min-height:auto !important; border-left:0 !important; border-right:0 !important; } .side-resizer { display:none !important; } .object-workspace-column { min-height:420px !important; } .right-panel { min-height:360px !important; border-top:1px solid var(--border) !important; } }
`;

const wizardState = { source: '', selectedRole: '' };

function injectStyles() {
  if (document.getElementById('object-creator-workflows')) return;
  const style = document.createElement('style');
  style.id = 'object-creator-workflows';
  style.textContent = WORKFLOW_CSS;
  document.head.appendChild(style);
}

function installButtonSafety() {
  const fixButtons = () => document.querySelectorAll('dialog button:not([type]):not([value])').forEach((button) => { button.type = 'button'; });
  fixButtons();
  new MutationObserver(fixButtons).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('click', (event) => {
    const close = event.target.closest('[data-close-dialog]');
    if (close) document.getElementById(close.dataset.closeDialog)?.close();
  });
}

function installWizard() {
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('#quickstart-wizard-button, #clone-existing-button');
    if (!trigger) return;
    event.preventDefault();
    event.stopPropagation();
    openWizard(trigger.id === 'clone-existing-button' ? 'existing' : '');
  });
}

function openWizard(forcedSource = '') {
  const dialog = document.getElementById('quickstart-dialog');
  if (!dialog) return;
  wizardState.source = forcedSource || '';
  wizardState.selectedRole = editorState.archetype.role || 'person_npc_basic';
  if (!dialog.open) dialog.showModal();
  forcedSource === 'existing' ? renderExistingChoice() : renderStartChoice();
}

function setWizardHeader(title, step) {
  const titleElement = document.getElementById('quickstart-title');
  const stepElement = document.getElementById('quickstart-step-label');
  if (titleElement) titleElement.textContent = title;
  if (stepElement) stepElement.textContent = step;
}
const content = () => document.getElementById('quickstart-content');

function renderStartChoice() {
  setWizardHeader('Quick Start Wizard', 'Step 1: choose a starting point');
  const node = content();
  if (!node) return;
  node.innerHTML = `<div class="wizard-choice-grid"><button type="button" class="wizard-choice" data-source="template"><strong>Template</strong><span>Start from a standard object type.</span></button><button type="button" class="wizard-choice" data-source="existing"><strong>Existing Object</strong><span>Copy a saved object and make a new version.</span></button></div>`;
  node.querySelector('[data-source="template"]')?.addEventListener('click', renderTemplateChoice);
  node.querySelector('[data-source="existing"]')?.addEventListener('click', renderExistingChoice);
}

function renderTemplateChoice() {
  wizardState.source = 'template';
  setWizardHeader('Quick Start Wizard', 'Step 2: what type of object is this?');
  const node = content();
  if (!node) return;
  node.innerHTML = `<p class="hint">Choose the closest starter. You can adjust actions, flags, IDs, and asset links on the next screens.</p><div class="wizard-toolbar"><button type="button" data-back>Back</button></div><div class="template-card-grid wizard-template-grid"></div>`;
  node.querySelector('[data-back]')?.addEventListener('click', renderStartChoice);
  const grid = node.querySelector('.wizard-template-grid');
  getAllTemplateIds().forEach((roleId) => grid.appendChild(createTemplateCard(roleId)));
}

function renderExistingChoice() {
  wizardState.source = 'existing';
  setWizardHeader('Quick Start Wizard', 'Step 2: choose an existing object to copy');
  const node = content();
  if (!node) return;
  const saved = listLocalArchetypes();
  node.innerHTML = `<p class="hint">This loads a copy with a new ID. The original is not overwritten.</p><div class="wizard-toolbar"><button type="button" data-back>Back</button></div><div class="template-card-grid wizard-existing-grid"></div>`;
  node.querySelector('[data-back]')?.addEventListener('click', renderStartChoice);
  const grid = node.querySelector('.wizard-existing-grid');
  if (!saved.length) {
    grid.innerHTML = '<p class="hint">No saved local objects yet. Start from a template or save an object locally first.</p>';
    return;
  }
  saved.forEach((item) => grid.appendChild(createExistingCard(item)));
}

function createTemplateCard(roleId) {
  const template = ROLE_TEMPLATES[roleId];
  const card = document.createElement('article');
  card.className = 'template-card';
  card.dataset.templateId = roleId;
  card.innerHTML = `<div class="template-card-body"><h4>${escapeHtml(template.label)}</h4><p>${escapeHtml(template.category)} · ${template.gameplayActions.length} gameplay actions</p></div>`;
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Choose Template';
  button.addEventListener('click', () => {
    applyRoleTemplate(roleId);
    wizardState.selectedRole = roleId;
    renderAbilityChoice();
  });
  card.appendChild(button);
  return card;
}

function createExistingCard(item) {
  const data = item.data || {};
  const roleId = ROLE_TEMPLATES[data.role] ? data.role : 'static_prop';
  const card = document.createElement('article');
  card.className = 'template-card';
  card.dataset.templateId = roleId;
  card.innerHTML = `<div class="template-card-body"><h4>${escapeHtml(data.name || data.id || 'Unnamed Object')}</h4><p>${escapeHtml(data.category || 'unknown')} · ${escapeHtml(data.role || 'no role')}</p></div>`;
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Copy This Object';
  button.addEventListener('click', () => {
    loadArchetype(cloneAsNew(data));
    renderAbilityChoice();
  });
  card.appendChild(button);
  return card;
}

function renderAbilityChoice() {
  setWizardHeader('Quick Start Wizard', 'Step 3: what should it be able to do?');
  const node = content();
  if (!node) return;
  const item = editorState.archetype;
  node.innerHTML = `<p class="hint">Choose runtime behaviour, body actions, and portrait actions. Talk is not a body action.</p><div class="wizard-toolbar"><button type="button" data-back>Back</button><button type="button" data-next>Next: basic changes</button></div><div class="wizard-columns"><section><h3>Runtime Flags</h3><div class="wizard-checks" data-flags></div></section><section><h3>Gameplay Sprite Actions</h3><div class="wizard-checks" data-gameplay></div></section><section><h3>Dialogue Portrait Actions</h3><div class="wizard-checks" data-portrait></div></section></div>`;
  node.querySelector('[data-back]')?.addEventListener('click', () => wizardState.source === 'existing' ? renderExistingChoice() : renderTemplateChoice());
  node.querySelector('[data-next]')?.addEventListener('click', renderBasicChanges);
  renderFlagChecks(node.querySelector('[data-flags]'), item);
  renderActionChecks(node.querySelector('[data-gameplay]'), GAMEPLAY_ACTIONS, item.animationProfile.gameplayActions, 'gameplay');
  renderActionChecks(node.querySelector('[data-portrait]'), PORTRAIT_ACTIONS, item.animationProfile.portraitActions, 'portrait');
}

function renderFlagChecks(container, item) {
  RUNTIME_FLAGS.forEach((flag) => {
    const row = document.createElement('label');
    row.className = 'wizard-check-row';
    row.innerHTML = `<span>${escapeHtml(flag.label)}</span><input type="checkbox" ${item.behaviour.flags[flag.key] ? 'checked' : ''} />`;
    row.querySelector('input').addEventListener('change', (event) => updateFlag(flag.key, event.target.checked));
    container.appendChild(row);
  });
}

function renderActionChecks(container, actions, selected, type) {
  const selectedSet = new Set(selected);
  actions.forEach((action) => {
    const row = document.createElement('label');
    row.className = 'wizard-check-row';
    row.innerHTML = `<span>${escapeHtml(action.label)}</span><input type="checkbox" ${selectedSet.has(action.id) ? 'checked' : ''} />`;
    row.querySelector('input').addEventListener('change', () => type === 'gameplay' ? toggleGameplayAction(action.id) : togglePortraitAction(action.id));
    container.appendChild(row);
  });
}

function renderBasicChanges() {
  setWizardHeader('Quick Start Wizard', 'Step 4: make the basic changes');
  const node = content();
  if (!node) return;
  const item = editorState.archetype;
  node.innerHTML = `<p class="hint">Make this starter object become its own new archetype.</p><div class="wizard-toolbar"><button type="button" data-back>Back</button><button type="button" data-build>Next: setup checklist</button></div><div class="wizard-form-grid"><label>Archetype ID<input data-field="id" value="${escapeHtml(item.id)}" /></label><label>Name<input data-field="name" value="${escapeHtml(item.name)}" /></label><label>Subtype<input data-field="subtype" value="${escapeHtml(item.subtype)}" /></label><label>Tags<input data-field="tags" value="${escapeHtml(item.tags.join(', '))}" /></label><label>Gameplay Sprite Asset ID<input data-field="spriteAssetId" value="${escapeHtml(item.visual.spriteAssetId)}" /></label><label>Dialogue Portrait Asset ID<input data-field="portraitAssetId" value="${escapeHtml(item.visual.portraitAssetId)}" /></label></div>`;
  node.querySelector('[data-back]')?.addEventListener('click', renderAbilityChoice);
  node.querySelector('[data-build]')?.addEventListener('click', renderBuildChecklist);
  node.querySelectorAll('[data-field]').forEach((input) => input.addEventListener('input', () => updateBasicField(input.dataset.field, input.value)));
}

function updateBasicField(field, value) {
  if (field === 'id') updateIdentity({ id: value });
  if (field === 'name') updateIdentity({ name: value });
  if (field === 'subtype') updateIdentity({ subtype: value });
  if (field === 'tags') updateIdentity({ tags: value });
  if (field === 'spriteAssetId') updateArchetype({ visual: { spriteAssetId: value } });
  if (field === 'portraitAssetId') updateArchetype({ visual: { portraitAssetId: value } });
}

function renderBuildChecklist() {
  setWizardHeader('Quick Start Wizard', 'Step 5: attach the files this object needs');
  const node = content();
  if (!node) return;
  const requirements = buildRequirements(editorState.archetype);
  ensureProductionAssets(requirements);
  node.innerHTML = `<p class="hint">Open each requirement, choose sprite sheet or individual images, add asset paths, assign sounds, and mark complete.</p><div class="wizard-toolbar"><button type="button" data-back>Back</button><button type="button" data-save>Finish + Save Local</button><button type="button" data-finish>Finish</button></div><div class="wizard-build-list"></div>`;
  const list = node.querySelector('.wizard-build-list');
  requirements.forEach((requirement) => list.appendChild(createRequirementCard(requirement)));
  node.querySelector('[data-back]')?.addEventListener('click', renderBasicChanges);
  node.querySelector('[data-save]')?.addEventListener('click', () => finishWizard(true));
  node.querySelector('[data-finish]')?.addEventListener('click', () => finishWizard(false));
}

function buildRequirements(item) {
  const reqs = [];
  (item.animationProfile.gameplayActions || []).forEach((id) => reqs.push({ id: `gameplay:${id}`, type: 'gameplay', actionId: id, label: labelFor(GAMEPLAY_ACTIONS, id), defaultMode: 'sprite_sheet' }));
  (item.animationProfile.portraitActions || []).forEach((id) => reqs.push({ id: `portrait:${id}`, type: 'portrait', actionId: id, label: labelFor(PORTRAIT_ACTIONS, id), defaultMode: id.includes('overlay') ? 'individual_images' : 'sprite_sheet' }));
  if (item.behaviour.flags.hasCollision) reqs.push({ id: 'metadata:collision', type: 'metadata', actionId: 'collision', label: 'Collision / Hitbox Check', defaultMode: 'metadata' });
  if (item.behaviour.flags.interactable) reqs.push({ id: 'metadata:interaction', type: 'metadata', actionId: 'interaction', label: 'Interaction Prompt / Invoke Setup', defaultMode: 'metadata' });
  return reqs;
}

function ensureProductionAssets(requirements) {
  const productionAssets = editorState.archetype.productionAssets || { version: VERSION, requirements: {} };
  productionAssets.version = VERSION;
  productionAssets.requirements = productionAssets.requirements || {};
  requirements.forEach((req) => {
    productionAssets.requirements[req.id] = { mode: req.defaultMode, spriteSheetAssetId: '', imageAssetIds: '', frameCount: '', fps: '', soundAssetId: '', notes: '', complete: false, ...(productionAssets.requirements[req.id] || {}) };
  });
  updateArchetype({ productionAssets });
}

function createRequirementCard(req) {
  const data = editorState.archetype.productionAssets?.requirements?.[req.id] || {};
  const card = document.createElement('article');
  card.className = `wizard-build-item ${data.complete ? 'is-complete' : ''}`;
  card.innerHTML = `<button type="button" class="wizard-build-summary"><span><strong>${escapeHtml(req.label)}</strong><span>${escapeHtml(req.type)} · ${escapeHtml(req.actionId)}</span></span><em>${data.complete ? 'Ready' : 'Needed'}</em></button><div class="wizard-build-detail"><label>Asset style<select data-build="mode"><option value="sprite_sheet">Sprite sheet</option><option value="individual_images">Individual images</option><option value="metadata">Metadata / no image</option></select></label><label>Sprite sheet asset/path<input data-build="spriteSheetAssetId" placeholder="assets/characters/mel/mel_walk_sheet.png" /></label><label>Individual image paths / asset IDs<textarea data-build="imageAssetIds" rows="3"></textarea></label><div class="wizard-build-row"><label>Frame count<input data-build="frameCount" type="number" min="0" /></label><label>FPS<input data-build="fps" type="number" min="0" /></label></div><label>Sound asset/path<input data-build="soundAssetId" placeholder="assets/audio/sfx/jump.ogg" /></label><label>Notes<textarea data-build="notes" rows="2"></textarea></label><label class="wizard-check-row"><span>Mark complete</span><input data-build="complete" type="checkbox" /></label></div>`;
  card.querySelector('.wizard-build-summary').addEventListener('click', () => card.classList.toggle('is-open'));
  card.querySelectorAll('[data-build]').forEach((field) => {
    const key = field.dataset.build;
    if (field.type === 'checkbox') field.checked = Boolean(data[key]);
    else field.value = data[key] ?? (key === 'mode' ? req.defaultMode : '');
    field.addEventListener('input', () => updateRequirement(req.id, key, field.type === 'checkbox' ? field.checked : field.value, card));
    field.addEventListener('change', () => updateRequirement(req.id, key, field.type === 'checkbox' ? field.checked : field.value, card));
  });
  return card;
}

function updateRequirement(id, key, value, card) {
  const productionAssets = editorState.archetype.productionAssets || { version: VERSION, requirements: {} };
  productionAssets.requirements[id] = { ...(productionAssets.requirements[id] || {}), [key]: value };
  updateArchetype({ productionAssets });
  if (key === 'complete') {
    card.classList.toggle('is-complete', Boolean(value));
    const badge = card.querySelector('em');
    if (badge) badge.textContent = value ? 'Ready' : 'Needed';
  }
}

function finishWizard(shouldSave) {
  validateCurrentArchetype();
  if (shouldSave) saveCurrentLocal();
  document.getElementById('quickstart-dialog')?.close();
  window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message: shouldSave ? 'Object setup saved locally.' : 'Object setup checklist added.', type: 'success' } }));
}

function getAllTemplateIds() { return [...PEOPLE_TEMPLATE_IDS, ...OBJECT_TEMPLATE_IDS]; }
function labelFor(list, id) { return list.find((item) => item.id === id)?.label || humanize(id); }
function cloneAsNew(data) { const clone = JSON.parse(JSON.stringify(data || {})); const suffix = Date.now().toString(36).slice(-5); clone.id = `${safeId(clone.id || clone.name || 'object_archetype')}_variant_${suffix}`; clone.name = `${clone.name || 'Object Archetype'} Variant`; clone.createdAt = new Date().toISOString(); clone.updatedAt = new Date().toISOString(); return clone; }
function safeId(value) { return String(value || 'object_archetype').trim().toLowerCase().replace(/[^a-z0-9_\-]+/g, '_').replace(/^_+|_+$/g, '') || 'object_archetype'; }
function humanize(value) { return String(value || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }

window.addEventListener('DOMContentLoaded', () => {
  injectStyles();
  installButtonSafety();
  installWizard();
});
