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

const VERSION = '1.09';
const SESSION_PREFIX = 'artifex.objectCreatorWizard.';

const WORKFLOW_CSS = `
.object-creator-shell{display:grid!important;grid-template-columns:300px 7px minmax(420px,1fr) minmax(330px,380px)!important;grid-template-rows:1fr!important;min-width:0!important;min-height:0!important;overflow:hidden!important}.compact-left-panel{width:auto!important;min-width:0!important;max-width:none!important;padding:10px!important}.compact-left-panel .card{margin-bottom:10px!important;padding:11px!important}.compact-left-panel label{margin:8px 0!important}.compact-left-panel input,.compact-left-panel select{padding:8px 9px!important}.object-workspace-column{min-width:0!important;min-height:0!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}.right-panel{min-width:0!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;background:rgba(23,18,16,.96)!important;border-left:1px solid var(--border)!important;box-shadow:-8px 0 24px rgba(0,0,0,.55)!important}.right-panel-header{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;min-height:50px!important;padding:12px 12px 8px!important;border-bottom:1px solid rgba(56,42,33,.7)!important}.right-panel-header h2{margin:0!important;color:var(--gold-bright)!important;font-family:'Cinzel',Georgia,serif!important;font-size:13px!important;letter-spacing:.13em!important;text-transform:uppercase!important}.right-panel-header #action-count{flex:0 0 auto!important;color:var(--red-strong)!important;font-size:11px!important;white-space:nowrap!important}.right-tab-input{position:absolute!important;opacity:0!important;pointer-events:none!important;width:1px!important;height:1px!important}.right-tabbar{display:flex!important;gap:7px!important;overflow-x:auto!important;overflow-y:hidden!important;padding:9px 10px!important;border-bottom:1px solid rgba(56,42,33,.72)!important;background:rgba(15,12,11,.74)!important;scrollbar-width:thin!important}.right-tabbar label{flex:0 0 auto!important;margin:0!important;padding:8px 11px!important;border:1px solid var(--border)!important;border-radius:var(--radius-pill)!important;background:#100c0b!important;color:var(--gold)!important;font-size:11px!important;font-weight:800!important;letter-spacing:.08em!important;text-transform:uppercase!important;cursor:pointer!important;user-select:none!important;white-space:nowrap!important}#right-tab-actions:checked~.right-tabbar label[for='right-tab-actions'],#right-tab-portraits:checked~.right-tabbar label[for='right-tab-portraits'],#right-tab-flags:checked~.right-tabbar label[for='right-tab-flags'],#right-tab-validation:checked~.right-tabbar label[for='right-tab-validation']{border-color:var(--red)!important;color:white!important;background:rgba(216,69,69,.20)!important;box-shadow:0 0 14px rgba(216,69,69,.22)!important}.right-panel-body{min-height:0!important;flex:1!important;overflow:auto!important;padding:12px!important}.right-tab-panel{display:none!important}#right-tab-actions:checked~.right-panel-body [data-right-panel='actions'],#right-tab-portraits:checked~.right-panel-body [data-right-panel='portraits'],#right-tab-flags:checked~.right-panel-body [data-right-panel='flags'],#right-tab-validation:checked~.right-panel-body [data-right-panel='validation']{display:block!important}.vertical-chip-list{display:grid!important;grid-template-columns:1fr!important;gap:8px!important}.vertical-chip-list .action-chip{width:100%!important;text-align:left!important;justify-content:flex-start!important}.bottom-resizer,.bottom-panel{display:none!important}
.wizard-session-wrap{position:relative;display:none}.wizard-session-wrap.has-sessions{display:block}.wizard-session-button{width:34px;height:34px;border-radius:999px;border:1px solid var(--red)!important;background:rgba(216,69,69,.22)!important;color:#fff0ce!important;box-shadow:0 0 16px rgba(216,69,69,.35)!important}.wizard-session-menu{display:none;position:absolute;top:42px;left:0;z-index:50;min-width:260px;padding:8px;border:1px solid var(--border);border-radius:14px;background:#140f0d;box-shadow:0 12px 28px rgba(0,0,0,.62)}.wizard-session-wrap.is-open .wizard-session-menu{display:grid;gap:6px}.wizard-session-row{display:grid;grid-template-columns:1fr auto;gap:6px;align-items:center}.wizard-session-row button{font-size:12px;padding:8px}.wizard-session-row small{display:block;color:rgba(255,240,206,.58);font-size:10px;margin-top:2px}
.wizard-build-shell{display:grid;grid-template-columns:minmax(220px,280px) 1fr;gap:14px;min-height:520px;margin-top:14px}.wizard-build-left{border:1px solid rgba(226,204,167,.22);border-radius:16px;background:rgba(18,13,11,.72);overflow:auto}.wizard-build-nav{display:grid;gap:5px;padding:10px}.wizard-build-nav button{width:100%;display:flex;justify-content:space-between;gap:8px;text-align:left;font-size:12px;padding:9px 10px}.wizard-build-nav button.is-selected{border-color:var(--red)!important;background:rgba(216,69,69,.18)!important}.wizard-build-nav em{font-style:normal;color:#ff7878;font-size:10px;text-transform:uppercase}.wizard-build-nav button.is-complete em{color:#b8d56e}.wizard-build-detail-panel{border:1px solid rgba(226,204,167,.22);border-radius:16px;background:rgba(18,13,11,.82);padding:14px;min-width:0}.wizard-build-detail-panel h3{margin:0 0 4px;color:#fff0ce}.wizard-build-detail-panel label{display:grid;gap:5px;margin:0}.wizard-build-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin:12px 0}.wizard-frame-strip{display:flex;gap:10px;overflow-x:auto;padding:10px;border:1px dashed rgba(226,204,167,.28);border-radius:14px;background:rgba(0,0,0,.18);min-height:128px}.wizard-frame-box{flex:0 0 104px;min-height:104px;border:1px solid rgba(226,204,167,.24);border-radius:12px;background:rgba(24,18,15,.9);display:grid;grid-template-rows:78px auto;gap:4px;padding:6px;cursor:grab}.wizard-frame-box.is-drag-over{border-color:var(--red)!important}.wizard-frame-thumb{display:grid;place-items:center;overflow:hidden;border-radius:8px;background:#080605;color:rgba(255,240,206,.6);font-size:11px;text-align:center}.wizard-frame-thumb img{width:100%;height:100%;object-fit:contain}.wizard-frame-meta{display:flex;gap:4px;justify-content:center}.wizard-frame-meta button{min-height:22px;padding:2px 6px;font-size:10px}.wizard-preview-stage{display:grid;place-items:center;height:220px;margin:10px 0;border:1px solid rgba(226,204,167,.22);border-radius:14px;background:#070505}.wizard-preview-stage img{max-width:100%;max-height:100%;object-fit:contain}.wizard-build-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}@media(max-width:980px){.object-creator-shell{display:flex!important;flex-direction:column!important;overflow:auto!important;height:auto!important;min-height:calc(100vh - 116px)!important}.compact-left-panel,.right-panel{width:100%!important;max-width:none!important;min-height:auto!important;border-left:0!important;border-right:0!important}.side-resizer{display:none!important}.object-workspace-column{min-height:420px!important}.right-panel{min-height:360px!important;border-top:1px solid var(--border)!important}.wizard-build-shell{grid-template-columns:1fr}}
`;

const wizardState = { source: '', selectedRole: '', sessionId: '', selectedRequirementId: '', previewTimer: null, previewIndex: 0 };

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
  installWizardSessionIndicator();
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
  wizardState.sessionId = `session_${Date.now().toString(36)}`;
  wizardState.selectedRequirementId = '';
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
  setWizardHeader('Quick Start Wizard', 'Step 5: attach files, sounds, and frame order');
  const node = content();
  if (!node) return;
  const requirements = buildRequirements(editorState.archetype);
  ensureProductionAssets(requirements);
  if (!wizardState.selectedRequirementId || !requirements.some((item) => item.id === wizardState.selectedRequirementId)) wizardState.selectedRequirementId = requirements[0]?.id || '';
  autoSaveWizardSession();
  node.innerHTML = `<p class="hint">Use the list on the left. The right side edits the selected action. Drop images into frame boxes, drag/reorder them, and preview the sequence before finishing.</p><div class="wizard-toolbar"><button type="button" data-back>Back</button><button type="button" data-session>Save & Resume Later</button><button type="button" data-save>Finish + Save Local</button><button type="button" data-finish>Finish</button></div><div class="wizard-build-shell"><aside class="wizard-build-left"><div class="wizard-build-nav"></div></aside><section class="wizard-build-detail-panel"></section></div>`;
  node.querySelector('[data-back]')?.addEventListener('click', renderBasicChanges);
  node.querySelector('[data-session]')?.addEventListener('click', saveAndResumeLater);
  node.querySelector('[data-save]')?.addEventListener('click', () => finishWizard(true));
  node.querySelector('[data-finish]')?.addEventListener('click', () => finishWizard(false));
  renderRequirementList(requirements);
  renderRequirementDetail(requirements.find((item) => item.id === wizardState.selectedRequirementId) || requirements[0]);
}

function renderRequirementList(requirements) {
  const list = content()?.querySelector('.wizard-build-nav');
  if (!list) return;
  list.innerHTML = '';
  requirements.forEach((req) => {
    const data = getRequirementData(req.id);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `${req.id === wizardState.selectedRequirementId ? 'is-selected' : ''} ${data.complete ? 'is-complete' : ''}`;
    button.innerHTML = `<span>${escapeHtml(req.label)}<small>${escapeHtml(req.type)} · ${escapeHtml(req.actionId)}</small></span><em>${data.complete ? 'Ready' : 'Needed'}</em>`;
    button.addEventListener('click', () => {
      wizardState.selectedRequirementId = req.id;
      renderBuildChecklist();
    });
    list.appendChild(button);
  });
}

function renderRequirementDetail(req) {
  const panel = content()?.querySelector('.wizard-build-detail-panel');
  if (!panel) return;
  if (!req) {
    panel.innerHTML = '<p class="hint">No requirements selected.</p>';
    return;
  }
  const data = getRequirementData(req.id);
  panel.innerHTML = `<h3>${escapeHtml(req.label)}</h3><p class="hint">${escapeHtml(req.type)} · ${escapeHtml(req.actionId)}</p><div class="wizard-build-fields"><label>Asset style<select data-build="mode"><option value="sprite_sheet">Sprite sheet</option><option value="individual_images">Individual images</option><option value="metadata">Metadata / no image</option></select></label><label>Sprite sheet asset/path<input data-build="spriteSheetAssetId" placeholder="assets/characters/mel/mel_walk_sheet.png" /></label><label>Frame count<input data-build="frameCount" type="number" min="0" /></label><label>FPS<input data-build="fps" type="number" min="0" placeholder="8" /></label><label>Sound asset/path<input data-build="soundAssetId" placeholder="assets/audio/sfx/jump.ogg" /></label><label>Complete<label class="wizard-check-row"><span>Mark complete</span><input data-build="complete" type="checkbox" /></label></label></div><label>Notes<textarea data-build="notes" rows="2" placeholder="alignment, frame order, special rules"></textarea></label><div class="wizard-build-actions"><label class="button-like">Add image files<input type="file" accept="image/*" multiple hidden data-frame-files /></label><button type="button" data-empty-frame>Add empty image slot</button><button type="button" data-preview>Preview</button><button type="button" data-stop-preview>Stop</button></div><div class="wizard-frame-strip" data-frame-strip><p class="hint">Drop image files here or use Add image files. Drag boxes sideways to change order.</p></div><div class="wizard-preview-stage" data-preview-stage><span class="hint">Preview appears here.</span></div>`;
  panel.querySelectorAll('[data-build]').forEach((field) => {
    const key = field.dataset.build;
    if (field.type === 'checkbox') field.checked = Boolean(data[key]);
    else field.value = data[key] ?? (key === 'mode' ? req.defaultMode : '');
    field.addEventListener('input', () => updateRequirement(req.id, key, field.type === 'checkbox' ? field.checked : field.value));
    field.addEventListener('change', () => updateRequirement(req.id, key, field.type === 'checkbox' ? field.checked : field.value));
  });
  panel.querySelector('[data-frame-files]')?.addEventListener('change', (event) => handleFrameFiles(req.id, [...event.target.files]));
  panel.querySelector('[data-empty-frame]')?.addEventListener('click', () => addEmptyFrame(req.id));
  panel.querySelector('[data-preview]')?.addEventListener('click', () => startPreview(req.id));
  panel.querySelector('[data-stop-preview]')?.addEventListener('click', stopPreview);
  const strip = panel.querySelector('[data-frame-strip]');
  strip.addEventListener('dragover', (event) => { event.preventDefault(); strip.classList.add('is-drag-over'); });
  strip.addEventListener('dragleave', () => strip.classList.remove('is-drag-over'));
  strip.addEventListener('drop', (event) => {
    event.preventDefault();
    strip.classList.remove('is-drag-over');
    const files = [...event.dataTransfer.files].filter((file) => file.type.startsWith('image/'));
    if (files.length) handleFrameFiles(req.id, files);
  });
  renderFrames(req.id);
}

function renderFrames(requirementId) {
  const strip = content()?.querySelector('[data-frame-strip]');
  if (!strip) return;
  const frames = getRequirementData(requirementId).frames || [];
  strip.innerHTML = '';
  if (!frames.length) strip.innerHTML = '<p class="hint">No frames yet.</p>';
  frames.forEach((frame, index) => {
    const box = document.createElement('div');
    box.className = 'wizard-frame-box';
    box.draggable = true;
    box.dataset.index = String(index);
    box.innerHTML = `<div class="wizard-frame-thumb">${frame.dataUrl ? `<img src="${frame.dataUrl}" alt="${escapeHtml(frame.name || `Frame ${index + 1}`)}" />` : `<span>${escapeHtml(frame.name || `Frame ${index + 1}`)}</span>`}</div><div class="wizard-frame-meta"><button type="button" data-left>‹</button><button type="button" data-remove>×</button><button type="button" data-right>›</button></div>`;
    box.querySelector('[data-left]')?.addEventListener('click', () => moveFrame(requirementId, index, index - 1));
    box.querySelector('[data-right]')?.addEventListener('click', () => moveFrame(requirementId, index, index + 1));
    box.querySelector('[data-remove]')?.addEventListener('click', () => removeFrame(requirementId, index));
    box.addEventListener('dragstart', (event) => event.dataTransfer.setData('text/plain', String(index)));
    box.addEventListener('dragover', (event) => { event.preventDefault(); box.classList.add('is-drag-over'); });
    box.addEventListener('dragleave', () => box.classList.remove('is-drag-over'));
    box.addEventListener('drop', (event) => {
      event.preventDefault();
      box.classList.remove('is-drag-over');
      const from = Number(event.dataTransfer.getData('text/plain'));
      if (Number.isFinite(from)) moveFrame(requirementId, from, index);
    });
    strip.appendChild(box);
  });
}

function handleFrameFiles(requirementId, files) {
  Promise.all(files.map(readFrameFile)).then((newFrames) => {
    const data = getRequirementData(requirementId);
    setRequirementData(requirementId, { ...data, frames: [...(data.frames || []), ...newFrames], imageAssetIds: [...(data.frames || []), ...newFrames].map((frame) => frame.name).join(', ') });
    renderRequirementDetail(buildRequirements(editorState.archetype).find((item) => item.id === requirementId));
  });
}

function readFrameFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ id: `frame_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`, name: file.name, assetId: file.name, dataUrl: String(reader.result || '') });
    reader.readAsDataURL(file);
  });
}

function addEmptyFrame(requirementId) {
  const data = getRequirementData(requirementId);
  const frames = [...(data.frames || []), { id: `frame_${Date.now().toString(36)}`, name: `Frame ${(data.frames || []).length + 1}`, assetId: '', dataUrl: '' }];
  setRequirementData(requirementId, { ...data, frames });
  renderFrames(requirementId);
}

function moveFrame(requirementId, from, to) {
  const data = getRequirementData(requirementId);
  const frames = [...(data.frames || [])];
  if (to < 0 || to >= frames.length || from === to) return;
  const [frame] = frames.splice(from, 1);
  frames.splice(to, 0, frame);
  setRequirementData(requirementId, { ...data, frames, imageAssetIds: frames.map((item) => item.name || item.assetId).filter(Boolean).join(', ') });
  renderFrames(requirementId);
}

function removeFrame(requirementId, index) {
  const data = getRequirementData(requirementId);
  const frames = [...(data.frames || [])];
  frames.splice(index, 1);
  setRequirementData(requirementId, { ...data, frames, imageAssetIds: frames.map((item) => item.name || item.assetId).filter(Boolean).join(', ') });
  renderFrames(requirementId);
}

function startPreview(requirementId) {
  stopPreview();
  const frames = (getRequirementData(requirementId).frames || []).filter((frame) => frame.dataUrl);
  const stage = content()?.querySelector('[data-preview-stage]');
  if (!stage || !frames.length) return;
  const fps = Math.max(1, Number(getRequirementData(requirementId).fps) || 8);
  wizardState.previewIndex = 0;
  const paint = () => {
    const frame = frames[wizardState.previewIndex % frames.length];
    stage.innerHTML = `<img src="${frame.dataUrl}" alt="${escapeHtml(frame.name || 'Preview frame')}" />`;
    wizardState.previewIndex += 1;
  };
  paint();
  wizardState.previewTimer = window.setInterval(paint, 1000 / fps);
}

function stopPreview() {
  if (wizardState.previewTimer) window.clearInterval(wizardState.previewTimer);
  wizardState.previewTimer = null;
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
    productionAssets.requirements[req.id] = { mode: req.defaultMode, spriteSheetAssetId: '', imageAssetIds: '', frames: [], frameCount: '', fps: '', soundAssetId: '', notes: '', complete: false, ...(productionAssets.requirements[req.id] || {}) };
  });
  updateArchetype({ productionAssets });
}

function getRequirementData(id) {
  return editorState.archetype.productionAssets?.requirements?.[id] || {};
}
function setRequirementData(id, data) {
  const productionAssets = editorState.archetype.productionAssets || { version: VERSION, requirements: {} };
  productionAssets.requirements = productionAssets.requirements || {};
  productionAssets.requirements[id] = data;
  updateArchetype({ productionAssets });
  autoSaveWizardSession();
}
function updateRequirement(id, key, value) {
  setRequirementData(id, { ...getRequirementData(id), [key]: value });
  renderRequirementList(buildRequirements(editorState.archetype));
}

function finishWizard(shouldSave) {
  stopPreview();
  validateCurrentArchetype();
  if (shouldSave) saveCurrentLocal();
  deleteWizardSession(wizardState.sessionId);
  document.getElementById('quickstart-dialog')?.close();
  window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message: shouldSave ? 'Object setup saved locally.' : 'Object setup checklist added.', type: 'success' } }));
}
function saveAndResumeLater() {
  saveWizardSession();
  document.getElementById('quickstart-dialog')?.close();
  window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message: 'Wizard saved. Resume it from the icon beside File.', type: 'success' } }));
}

function installWizardSessionIndicator() {
  const menuBar = document.querySelector('.menu-bar');
  if (!menuBar || document.getElementById('wizard-session-wrap')) return;
  const wrap = document.createElement('div');
  wrap.id = 'wizard-session-wrap';
  wrap.className = 'wizard-session-wrap';
  wrap.innerHTML = `<button type="button" class="wizard-session-button" title="Open saved Quick Start wizards">✦</button><div class="wizard-session-menu"></div>`;
  menuBar.prepend(wrap);
  wrap.querySelector('.wizard-session-button').addEventListener('click', () => {
    wrap.classList.toggle('is-open');
    renderWizardSessionMenu();
  });
  refreshWizardSessionIndicator();
}
function autoSaveWizardSession() {
  if (wizardState.sessionId) saveWizardSession(false);
}
function saveWizardSession(showToast = false) {
  if (!wizardState.sessionId) wizardState.sessionId = `session_${Date.now().toString(36)}`;
  const session = { id: wizardState.sessionId, title: editorState.archetype.name || editorState.archetype.id, updatedAt: new Date().toISOString(), selectedRequirementId: wizardState.selectedRequirementId, archetype: editorState.archetype };
  localStorage.setItem(`${SESSION_PREFIX}${session.id}`, JSON.stringify(session));
  refreshWizardSessionIndicator();
  if (showToast) window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message: 'Wizard saved.', type: 'success' } }));
}
function listWizardSessions() {
  const items = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith(SESSION_PREFIX)) continue;
    try { items.push(JSON.parse(localStorage.getItem(key))); } catch {}
  }
  return items.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}
function refreshWizardSessionIndicator() {
  const wrap = document.getElementById('wizard-session-wrap');
  if (!wrap) return;
  wrap.classList.toggle('has-sessions', listWizardSessions().length > 0);
}
function renderWizardSessionMenu() {
  const menu = document.querySelector('#wizard-session-wrap .wizard-session-menu');
  if (!menu) return;
  const sessions = listWizardSessions();
  if (!sessions.length) { menu.innerHTML = '<p class="hint">No saved wizards.</p>'; return; }
  menu.innerHTML = '';
  sessions.forEach((session) => {
    const row = document.createElement('div');
    row.className = 'wizard-session-row';
    row.innerHTML = `<button type="button" data-resume>${escapeHtml(session.title || session.id)}<small>${escapeHtml(new Date(session.updatedAt).toLocaleString())}</small></button><button type="button" data-delete>×</button>`;
    row.querySelector('[data-resume]').addEventListener('click', () => resumeWizardSession(session.id));
    row.querySelector('[data-delete]').addEventListener('click', () => { deleteWizardSession(session.id); renderWizardSessionMenu(); });
    menu.appendChild(row);
  });
}
function resumeWizardSession(id) {
  const raw = localStorage.getItem(`${SESSION_PREFIX}${id}`);
  if (!raw) return;
  const session = JSON.parse(raw);
  loadArchetype(session.archetype);
  wizardState.sessionId = session.id;
  wizardState.selectedRequirementId = session.selectedRequirementId || '';
  document.getElementById('wizard-session-wrap')?.classList.remove('is-open');
  const dialog = document.getElementById('quickstart-dialog');
  if (dialog && !dialog.open) dialog.showModal();
  renderBuildChecklist();
}
function deleteWizardSession(id) {
  if (id) localStorage.removeItem(`${SESSION_PREFIX}${id}`);
  refreshWizardSessionIndicator();
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
