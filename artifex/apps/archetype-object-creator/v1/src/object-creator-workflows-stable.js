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

const VERSION = '1.12';
const SESSION_PREFIX = 'artifex.objectCreatorWizard.';

const EMOJI = {
  idle: '🧍', turn_face: '↔️', walk: '👟', patrol_walk: '🚶', move: '➡️', jump: '🦘', crouch_hide: '🫥', pickup: '🤲', hold_carry: '📦', throw: '🪨', use_item: '🛠️', gesture: '👋', give_item: '🎁', receive_item: '📥', interact_assist: '🤝', sing_magic_cast: '🎵', cast_ritual: '✨', channel: '🔮', attack: '⚔️', special_attack: '💥', take_damage: '💢', stunned: '💫', phase_change: '🌀', death: '☠️', enter_door: '🚪', exit_door: '🚪', open: '🔓', close: '🔒', locked: '🔐', collect: '🪙', searched_opened: '🔍', activate: '⚡', trigger: '🎚️', reset: '↩️', land_break: '💥', possession_overlay: '👁️', blink: '😉', expression_neutral: '😐', expression_happy: '🙂', expression_angry: '😠', expression_sad: '😟', mouth_loop: '🗣️', gameplay_sprite_asset: '🧩', dialogue_portrait_asset: '🖼️', collision: '📐', interaction: '💬'
};

const CSS = `
.object-creator-shell{display:grid!important;grid-template-columns:300px 7px minmax(420px,1fr) minmax(330px,380px)!important;grid-template-rows:1fr!important;min-width:0!important;min-height:0!important;overflow:hidden!important}.compact-left-panel{width:auto!important;min-width:0!important;max-width:none!important;padding:10px!important}.compact-left-panel .card{margin-bottom:10px!important;padding:11px!important}.compact-left-panel label{margin:8px 0!important}.compact-left-panel input,.compact-left-panel select{padding:8px 9px!important}.object-workspace-column{min-width:0!important;min-height:0!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}.right-panel{min-width:0!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;background:rgba(23,18,16,.96)!important;border-left:1px solid var(--border)!important;box-shadow:-8px 0 24px rgba(0,0,0,.55)!important}.right-panel-header{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;min-height:50px!important;padding:12px 12px 8px!important;border-bottom:1px solid rgba(56,42,33,.7)!important}.right-panel-header h2{margin:0!important;color:var(--gold-bright)!important;font-family:'Cinzel',Georgia,serif!important;font-size:13px!important;letter-spacing:.13em!important;text-transform:uppercase!important}.right-panel-header #action-count{flex:0 0 auto!important;color:var(--red-strong)!important;font-size:11px!important;white-space:nowrap!important}.right-tab-input{position:absolute!important;opacity:0!important;pointer-events:none!important;width:1px!important;height:1px!important}.right-tabbar{display:flex!important;gap:7px!important;overflow-x:auto!important;overflow-y:hidden!important;padding:9px 10px!important;border-bottom:1px solid rgba(56,42,33,.72)!important;background:rgba(15,12,11,.74)!important;scrollbar-width:thin!important}.right-tabbar label{flex:0 0 auto!important;margin:0!important;padding:8px 11px!important;border:1px solid var(--border)!important;border-radius:var(--radius-pill)!important;background:#100c0b!important;color:var(--gold)!important;font-size:11px!important;font-weight:800!important;letter-spacing:.08em!important;text-transform:uppercase!important;cursor:pointer!important;user-select:none!important;white-space:nowrap!important}#right-tab-actions:checked~.right-tabbar label[for='right-tab-actions'],#right-tab-portraits:checked~.right-tabbar label[for='right-tab-portraits'],#right-tab-flags:checked~.right-tabbar label[for='right-tab-flags'],#right-tab-validation:checked~.right-tabbar label[for='right-tab-validation']{border-color:var(--red)!important;color:white!important;background:rgba(216,69,69,.20)!important;box-shadow:0 0 14px rgba(216,69,69,.22)!important}.right-panel-body{min-height:0!important;flex:1!important;overflow:auto!important;padding:12px!important}.right-tab-panel{display:none!important}#right-tab-actions:checked~.right-panel-body [data-right-panel='actions'],#right-tab-portraits:checked~.right-panel-body [data-right-panel='portraits'],#right-tab-flags:checked~.right-panel-body [data-right-panel='flags'],#right-tab-validation:checked~.right-panel-body [data-right-panel='validation']{display:block!important}.vertical-chip-list{display:grid!important;grid-template-columns:1fr!important;gap:8px!important}.vertical-chip-list .action-chip{width:100%!important;text-align:left!important;justify-content:flex-start!important}.bottom-resizer,.bottom-panel{display:none!important}
.wizard-session-wrap{position:relative;display:none}.wizard-session-wrap.has-sessions{display:block}.wizard-session-button{width:34px;height:34px;border-radius:999px;border:1px solid var(--red)!important;background:rgba(216,69,69,.22)!important;color:#fff0ce!important;box-shadow:0 0 16px rgba(216,69,69,.35)!important;font-size:17px!important}.wizard-session-menu{display:none;position:absolute;top:42px;left:0;z-index:50;min-width:280px;padding:8px;border:1px solid var(--border);border-radius:14px;background:#140f0d;box-shadow:0 12px 28px rgba(0,0,0,.62)}.wizard-session-wrap.is-open .wizard-session-menu{display:grid;gap:6px}.wizard-session-row{display:grid;grid-template-columns:1fr auto;gap:6px;align-items:center}.wizard-session-row button{font-size:12px;padding:8px}.wizard-session-row small{display:block;color:rgba(255,240,206,.58);font-size:10px;margin-top:2px}
.wizard-progress-orb{--progress:0%;position:relative;width:62px;height:62px;border-radius:999px;display:grid;place-items:center;margin-left:auto;margin-right:12px;background:conic-gradient(#17e3e5 0 var(--progress),#8f36b6 var(--progress) calc(var(--progress) + 22%),#d46b39 calc(var(--progress) + 22%) calc(var(--progress) + 36%),rgba(226,204,167,.18) 0);box-shadow:0 0 18px rgba(23,227,229,.18)}.wizard-progress-orb::before{content:'';position:absolute;width:43px;height:43px;border-radius:999px;background:#15100e}.wizard-progress-orb span{position:relative;color:#fff0ce;font-weight:900;font-size:14px;animation:wizardPulse 1.8s ease-in-out infinite}@keyframes wizardPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.09)}}
.wizard-build-shell{display:grid;grid-template-columns:minmax(230px,285px) 1fr;gap:14px;min-height:560px;margin-top:14px}.wizard-build-left{border:1px solid rgba(226,204,167,.22);border-radius:16px;background:rgba(18,13,11,.72);overflow:auto}.wizard-build-nav{display:grid;gap:5px;padding:10px}.wizard-build-nav button{width:100%;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:8px;text-align:left;font-size:12px;padding:9px 10px;cursor:grab}.wizard-build-nav button.is-selected{border-color:var(--red)!important;background:rgba(216,69,69,.18)!important}.wizard-build-nav button.is-drag-over{outline:1px solid var(--red)}.wizard-task-number{opacity:.62;font-variant-numeric:tabular-nums}.wizard-task-emoji{font-size:16px}.wizard-build-nav em{font-style:normal;color:#ff7878;font-size:10px;text-transform:uppercase}.wizard-build-nav button.is-complete em{color:#b8d56e}.wizard-build-detail-panel{border:1px solid rgba(226,204,167,.22);border-radius:16px;background:rgba(18,13,11,.82);padding:14px;min-width:0}.wizard-build-detail-panel h3{margin:0 0 4px;color:#fff0ce}.wizard-build-detail-panel label{display:grid;gap:5px;margin:0}.wizard-build-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin:12px 0}.wizard-preview-stage{width:min(100%,360px);aspect-ratio:1/1;display:grid;place-items:center;margin:10px 0;border:1px solid rgba(226,204,167,.22);border-radius:14px;background:#070505;overflow:hidden}.wizard-preview-stage img{max-width:100%;max-height:100%;object-fit:contain}.wizard-preview-controls{display:flex;flex-wrap:wrap;align-items:center;gap:7px;margin:8px 0 12px}.wizard-frame-readout{min-width:56px;text-align:center;color:#fff0ce;border:1px solid rgba(226,204,167,.24);border-radius:999px;padding:6px 10px;background:rgba(0,0,0,.22);font-size:12px}.wizard-correction-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:10px 0;padding:10px;border:1px solid rgba(226,204,167,.18);border-radius:14px;background:rgba(0,0,0,.15)}.wizard-frame-strip{display:flex;gap:10px;overflow-x:auto;padding:10px;border:1px dashed rgba(226,204,167,.28);border-radius:14px;background:rgba(0,0,0,.18);min-height:128px}.wizard-frame-box{flex:0 0 104px;min-height:104px;border:1px solid rgba(226,204,167,.24);border-radius:12px;background:rgba(24,18,15,.9);display:grid;grid-template-rows:78px auto;gap:4px;padding:6px;cursor:grab}.wizard-frame-box.is-drag-over,.wizard-frame-strip.is-drag-over{border-color:var(--red)!important}.wizard-frame-thumb{display:grid;place-items:center;overflow:hidden;border-radius:8px;background:#080605;color:rgba(255,240,206,.6);font-size:11px;text-align:center}.wizard-frame-thumb img{width:100%;height:100%;object-fit:contain}.wizard-frame-meta{display:flex;gap:4px;justify-content:center}.wizard-frame-meta button{min-height:22px;padding:2px 6px;font-size:10px}.wizard-build-actions{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}@media(max-width:980px){.object-creator-shell{display:flex!important;flex-direction:column!important;overflow:auto!important;height:auto!important;min-height:calc(100vh - 116px)!important}.compact-left-panel,.right-panel{width:100%!important;max-width:none!important;min-height:auto!important;border-left:0!important;border-right:0!important}.side-resizer{display:none!important}.object-workspace-column{min-height:420px!important}.right-panel{min-height:360px!important;border-top:1px solid var(--border)!important}.wizard-build-shell{grid-template-columns:1fr}.wizard-progress-orb{width:52px;height:52px}.wizard-progress-orb::before{width:36px;height:36px}}
`;

const wizardState = { source: '', sessionId: '', selectedRequirementId: '', previewTimer: null, previewPlaying: false };

function injectStyles() {
  if (document.getElementById('object-creator-workflows-stable')) return;
  const style = document.createElement('style');
  style.id = 'object-creator-workflows-stable';
  style.textContent = CSS;
  document.head.appendChild(style);
}

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
  installWizardSessionIndicator();
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
  updateProgressOrb();
}

function openWizard(source = '') {
  const dialog = document.getElementById('quickstart-dialog');
  if (!dialog) return;
  wizardState.source = source;
  wizardState.sessionId = `session_${Date.now().toString(36)}`;
  wizardState.selectedRequirementId = '';
  if (!dialog.open) dialog.showModal();
  source === 'existing' ? renderExistingChoice() : renderStartChoice();
}

function renderStartChoice() {
  setHeader('Step 1: choose a starting point');
  const node = content();
  node.innerHTML = `<div class="wizard-choice-grid"><button type="button" class="wizard-choice" data-source="template"><strong>Template</strong><span>Start from a standard object type.</span></button><button type="button" class="wizard-choice" data-source="existing"><strong>Existing Object</strong><span>Copy a saved object and make a new version.</span></button></div>`;
  node.querySelector('[data-source="template"]').addEventListener('click', renderTemplateChoice);
  node.querySelector('[data-source="existing"]').addEventListener('click', renderExistingChoice);
}

function renderTemplateChoice() {
  wizardState.source = 'template';
  setHeader('Step 2: what type of object is this?');
  const node = content();
  node.innerHTML = `<p class="hint">Choose the closest starter. You can adjust actions, flags, IDs, and asset links on the next screens.</p><div class="wizard-toolbar"><button type="button" data-back>Back</button></div><div class="template-card-grid wizard-template-grid"></div>`;
  node.querySelector('[data-back]').addEventListener('click', renderStartChoice);
  const grid = node.querySelector('.wizard-template-grid');
  [...PEOPLE_TEMPLATE_IDS, ...OBJECT_TEMPLATE_IDS].forEach((roleId) => grid.appendChild(createTemplateCard(roleId)));
}

function renderExistingChoice() {
  wizardState.source = 'existing';
  setHeader('Step 2: choose an existing object to copy');
  const node = content();
  const saved = listLocalArchetypes();
  node.innerHTML = `<p class="hint">This loads a copy with a new ID. The original is not overwritten.</p><div class="wizard-toolbar"><button type="button" data-back>Back</button></div><div class="template-card-grid wizard-existing-grid"></div>`;
  node.querySelector('[data-back]').addEventListener('click', renderStartChoice);
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
  button.addEventListener('click', () => { applyRoleTemplate(roleId); renderAbilityChoice(); });
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
  button.addEventListener('click', () => { loadArchetype(cloneAsNew(data)); renderAbilityChoice(); });
  card.appendChild(button);
  return card;
}

function renderAbilityChoice() {
  setHeader('Step 3: what should it be able to do?');
  const item = editorState.archetype;
  const node = content();
  node.innerHTML = `<p class="hint">Choose runtime behaviour, body actions, and portrait actions. Talk is not a body action.</p><div class="wizard-toolbar"><button type="button" data-back>Back</button><button type="button" data-next>Next: basic changes</button></div><div class="wizard-columns"><section><h3>Runtime Flags</h3><div class="wizard-checks" data-flags></div></section><section><h3>Gameplay Sprite Actions</h3><div class="wizard-checks" data-gameplay></div></section><section><h3>Dialogue Portrait Actions</h3><div class="wizard-checks" data-portrait></div></section></div>`;
  node.querySelector('[data-back]').addEventListener('click', () => wizardState.source === 'existing' ? renderExistingChoice() : renderTemplateChoice());
  node.querySelector('[data-next]').addEventListener('click', renderBasicChanges);
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
  setHeader('Step 4: make the basic changes');
  const item = editorState.archetype;
  const node = content();
  node.innerHTML = `<p class="hint">Make this starter object become its own new archetype. Sprite and portrait IDs can stay blank here because Step 5 tracks them as setup tasks.</p><div class="wizard-toolbar"><button type="button" data-back>Back</button><button type="button" data-build>Next: setup checklist</button></div><div class="wizard-form-grid"><label>Archetype ID<input data-field="id" value="${escapeHtml(item.id)}" /></label><label>Name<input data-field="name" value="${escapeHtml(item.name)}" /></label><label>Subtype<input data-field="subtype" value="${escapeHtml(item.subtype)}" /></label><label>Tags<input data-field="tags" value="${escapeHtml(item.tags.join(', '))}" /></label><label>Gameplay Sprite Asset ID<input data-field="spriteAssetId" value="${escapeHtml(item.visual.spriteAssetId)}" /></label><label>Dialogue Portrait Asset ID<input data-field="portraitAssetId" value="${escapeHtml(item.visual.portraitAssetId)}" /></label></div>`;
  node.querySelector('[data-back]').addEventListener('click', renderAbilityChoice);
  node.querySelector('[data-build]').addEventListener('click', renderBuildChecklist);
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
  stopPreview(false);
  setHeader('Step 5: attach files, sounds, and frame order');
  const requirements = buildRequirements(editorState.archetype);
  ensureProductionAssets(requirements);
  if (!wizardState.selectedRequirementId || !requirements.some((item) => item.id === wizardState.selectedRequirementId)) wizardState.selectedRequirementId = requirements[0]?.id || '';
  const node = content();
  node.innerHTML = `<p class="hint">Use the numbered list on the left. Drag tasks to reorder them. The right side edits one task at a time.</p><div class="wizard-toolbar"><button type="button" data-back>Back</button><button type="button" data-session>Save & Resume Later</button><button type="button" data-save>Finish + Save Local</button><button type="button" data-finish>Finish</button></div><div class="wizard-build-shell"><aside class="wizard-build-left"><div class="wizard-build-nav"></div></aside><section class="wizard-build-detail-panel"></section></div>`;
  node.querySelector('[data-back]').addEventListener('click', renderBasicChanges);
  node.querySelector('[data-session]').addEventListener('click', saveAndResumeLater);
  node.querySelector('[data-save]').addEventListener('click', () => finishWizard(true));
  node.querySelector('[data-finish]').addEventListener('click', () => finishWizard(false));
  autoSaveWizardSession();
  renderRequirementList(requirements);
  renderRequirementDetail(requirements.find((item) => item.id === wizardState.selectedRequirementId) || requirements[0]);
  updateProgressOrb();
}

function renderRequirementList(requirements) {
  const list = content()?.querySelector('.wizard-build-nav');
  list.innerHTML = '';
  orderedRequirements(requirements).forEach((req, index) => {
    const data = getRequirementData(req.id);
    const button = document.createElement('button');
    button.type = 'button';
    button.draggable = true;
    button.dataset.requirementId = req.id;
    button.className = `${req.id === wizardState.selectedRequirementId ? 'is-selected' : ''} ${data.complete ? 'is-complete' : ''}`;
    button.innerHTML = `<span class="wizard-task-number">${index + 1}</span><span><span class="wizard-task-emoji">${emojiFor(req.actionId)}</span> ${escapeHtml(req.label)}<small>${escapeHtml(req.type)} · ${escapeHtml(req.actionId)}</small></span><em>${data.complete ? 'Ready' : 'Needed'}</em>`;
    button.addEventListener('click', () => { wizardState.selectedRequirementId = req.id; renderBuildChecklist(); });
    button.addEventListener('dragstart', (event) => event.dataTransfer.setData('text/plain', req.id));
    button.addEventListener('dragover', (event) => { event.preventDefault(); button.classList.add('is-drag-over'); });
    button.addEventListener('dragleave', () => button.classList.remove('is-drag-over'));
    button.addEventListener('drop', (event) => { event.preventDefault(); button.classList.remove('is-drag-over'); moveRequirement(event.dataTransfer.getData('text/plain'), req.id, requirements); });
    list.appendChild(button);
  });
}

function renderRequirementDetail(req) {
  const panel = content()?.querySelector('.wizard-build-detail-panel');
  if (!req) { panel.innerHTML = '<p class="hint">No requirements selected.</p>'; return; }
  const data = getRequirementData(req.id);
  const frames = data.frames || [];
  const currentFrame = clampNumber(data.currentFrameIndex, 0, 0, Math.max(0, frames.length - 1));
  panel.innerHTML = `<h3>${emojiFor(req.actionId)} ${escapeHtml(req.label)}</h3><p class="hint">${escapeHtml(req.type)} · ${escapeHtml(req.actionId)}</p><div class="wizard-preview-stage" data-preview-stage></div><div class="wizard-preview-controls"><button type="button" data-play-toggle>${wizardState.previewPlaying ? 'Pause' : 'Play'}</button><button type="button" data-prev-frame>‹ Frame</button><span class="wizard-frame-readout" data-frame-readout>${frames.length ? currentFrame + 1 : 0}/${frames.length}</span><button type="button" data-next-frame>Frame ›</button></div><div class="wizard-build-fields"><label>Asset style<select data-build="mode"><option value="sprite_sheet">Sprite sheet</option><option value="individual_images">Individual images</option><option value="metadata">Metadata / no image</option></select></label><label>Sprite sheet / primary asset path<input data-build="spriteSheetAssetId" placeholder="assets/characters/mel/mel_walk_sheet.png" /></label><label>Frame count<input data-build="frameCount" type="number" min="0" /></label><label>FPS<input data-build="fps" type="number" min="0" placeholder="8" /></label><label>Sound asset/path<input data-build="soundAssetId" placeholder="assets/audio/sfx/jump.ogg" /></label><label class="wizard-check-row"><span>Mark complete</span><input data-build="complete" type="checkbox" /></label></div><label>Notes<textarea data-build="notes" rows="2" placeholder="alignment, frame order, special rules"></textarea></label><section class="wizard-correction-grid"><label>Scale correction %<input data-correct="scale" type="range" min="-10" max="10" value="${Number(data.correction?.scale || 0)}" /></label><label>Move X px<input data-correct="x" type="range" min="-10" max="10" value="${Number(data.correction?.x || 0)}" /></label><label>Move Y px<input data-correct="y" type="range" min="-10" max="10" value="${Number(data.correction?.y || 0)}" /></label><button type="button" data-match-brightness>Match brightness across frames</button></section><div class="wizard-build-actions"><label class="button-like">Add image files<input type="file" accept="image/*" multiple hidden data-frame-files /></label><button type="button" data-empty-frame>Add empty image slot</button></div><div class="wizard-frame-strip" data-frame-strip><p class="hint">Drop image files here or use Add image files. Drag boxes sideways to change order.</p></div>`;

  panel.querySelectorAll('[data-build]').forEach((field) => {
    const key = field.dataset.build;
    if (field.type === 'checkbox') field.checked = Boolean(data[key]);
    else field.value = data[key] ?? (key === 'mode' ? req.defaultMode : '');
    field.addEventListener('input', () => updateRequirement(req.id, key, field.type === 'checkbox' ? field.checked : field.value));
    field.addEventListener('change', () => updateRequirement(req.id, key, field.type === 'checkbox' ? field.checked : field.value));
  });
  panel.querySelectorAll('[data-correct]').forEach((field) => field.addEventListener('input', () => updateCorrection(req.id, field.dataset.correct, Number(field.value))));
  panel.querySelector('[data-frame-files]')?.addEventListener('change', (event) => handleFrameFiles(req.id, [...event.target.files]));
  panel.querySelector('[data-empty-frame]')?.addEventListener('click', () => addEmptyFrame(req.id));
  panel.querySelector('[data-play-toggle]')?.addEventListener('click', () => togglePreview(req.id));
  panel.querySelector('[data-prev-frame]')?.addEventListener('click', () => stepPreviewFrame(req.id, -1));
  panel.querySelector('[data-next-frame]')?.addEventListener('click', () => stepPreviewFrame(req.id, 1));
  panel.querySelector('[data-match-brightness]')?.addEventListener('click', () => matchBrightness(req.id));
  const strip = panel.querySelector('[data-frame-strip]');
  strip.addEventListener('dragover', (event) => { event.preventDefault(); strip.classList.add('is-drag-over'); });
  strip.addEventListener('dragleave', () => strip.classList.remove('is-drag-over'));
  strip.addEventListener('drop', (event) => { event.preventDefault(); strip.classList.remove('is-drag-over'); const files = [...event.dataTransfer.files].filter((file) => file.type.startsWith('image/')); if (files.length) handleFrameFiles(req.id, files); });
  renderFrames(req.id);
  paintPreviewFrame(req.id);
}

function renderFrames(requirementId) {
  const strip = content()?.querySelector('[data-frame-strip]');
  const data = getRequirementData(requirementId);
  const frames = data.frames || [];
  strip.innerHTML = '';
  if (!frames.length) strip.innerHTML = '<p class="hint">No frames yet.</p>';
  frames.forEach((frame, index) => {
    const box = document.createElement('div');
    box.className = 'wizard-frame-box';
    box.draggable = true;
    box.innerHTML = `<div class="wizard-frame-thumb">${frame.dataUrl ? `<img src="${frame.dataUrl}" style="${correctionStyle(data.correction)}" alt="${escapeHtml(frame.name || `Frame ${index + 1}`)}" />` : `<span>${escapeHtml(frame.name || `Frame ${index + 1}`)}</span>`}</div><div class="wizard-frame-meta"><button type="button" data-left>‹</button><button type="button" data-remove>×</button><button type="button" data-right>›</button></div>`;
    box.querySelector('[data-left]')?.addEventListener('click', () => moveFrame(requirementId, index, index - 1));
    box.querySelector('[data-right]')?.addEventListener('click', () => moveFrame(requirementId, index, index + 1));
    box.querySelector('[data-remove]')?.addEventListener('click', () => removeFrame(requirementId, index));
    box.addEventListener('click', () => setCurrentFrame(requirementId, index));
    box.addEventListener('dragstart', (event) => event.dataTransfer.setData('text/plain', String(index)));
    box.addEventListener('dragover', (event) => { event.preventDefault(); box.classList.add('is-drag-over'); });
    box.addEventListener('dragleave', () => box.classList.remove('is-drag-over'));
    box.addEventListener('drop', (event) => { event.preventDefault(); box.classList.remove('is-drag-over'); const from = Number(event.dataTransfer.getData('text/plain')); if (Number.isFinite(from)) moveFrame(requirementId, from, index); });
    strip.appendChild(box);
  });
}

function handleFrameFiles(requirementId, files) {
  Promise.all(files.map(readFrameFile)).then((newFrames) => {
    const data = getRequirementData(requirementId);
    const frames = [...(data.frames || []), ...newFrames];
    setRequirementData(requirementId, { ...data, frames, frameCount: frames.length, imageAssetIds: frames.map((frame) => frame.name).join(', ') });
    renderRequirementDetail(buildRequirements(editorState.archetype).find((item) => item.id === requirementId));
  });
}
function readFrameFile(file) { return new Promise((resolve) => { const reader = new FileReader(); reader.onload = () => resolve({ id: `frame_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`, name: file.name, assetId: file.name, dataUrl: String(reader.result || '') }); reader.readAsDataURL(file); }); }
function addEmptyFrame(requirementId) { const data = getRequirementData(requirementId); const frames = [...(data.frames || []), { id: `frame_${Date.now().toString(36)}`, name: `Frame ${(data.frames || []).length + 1}`, assetId: '', dataUrl: '' }]; setRequirementData(requirementId, { ...data, frames, frameCount: frames.length }); renderFrames(requirementId); paintPreviewFrame(requirementId); }
function moveFrame(requirementId, from, to) { const data = getRequirementData(requirementId); const frames = [...(data.frames || [])]; if (to < 0 || to >= frames.length || from === to) return; const [frame] = frames.splice(from, 1); frames.splice(to, 0, frame); setRequirementData(requirementId, { ...data, frames, imageAssetIds: frames.map((item) => item.name || item.assetId).filter(Boolean).join(', ') }); renderFrames(requirementId); paintPreviewFrame(requirementId); }
function removeFrame(requirementId, index) { const data = getRequirementData(requirementId); const frames = [...(data.frames || [])]; frames.splice(index, 1); setRequirementData(requirementId, { ...data, frames, frameCount: frames.length, currentFrameIndex: Math.min(index, Math.max(0, frames.length - 1)), imageAssetIds: frames.map((item) => item.name || item.assetId).filter(Boolean).join(', ') }); renderFrames(requirementId); paintPreviewFrame(requirementId); }
function setCurrentFrame(requirementId, index) { setRequirementData(requirementId, { ...getRequirementData(requirementId), currentFrameIndex: index }); paintPreviewFrame(requirementId); }
function togglePreview(requirementId) { wizardState.previewPlaying ? stopPreview() : startPreview(requirementId); renderRequirementDetail(buildRequirements(editorState.archetype).find((item) => item.id === requirementId)); }
function startPreview(requirementId) { stopPreview(false); const frames = (getRequirementData(requirementId).frames || []).filter((frame) => frame.dataUrl); if (!frames.length) return; const fps = Math.max(1, Number(getRequirementData(requirementId).fps) || 8); wizardState.previewPlaying = true; wizardState.previewTimer = window.setInterval(() => stepPreviewFrame(requirementId, 1, false), 1000 / fps); }
function stopPreview(repaint = true) { if (wizardState.previewTimer) window.clearInterval(wizardState.previewTimer); wizardState.previewTimer = null; wizardState.previewPlaying = false; if (repaint && wizardState.selectedRequirementId) paintPreviewFrame(wizardState.selectedRequirementId); }
function stepPreviewFrame(requirementId, direction) { const data = getRequirementData(requirementId); const frames = data.frames || []; if (!frames.length) return; const next = (clampNumber(data.currentFrameIndex, 0, 0, frames.length - 1) + direction + frames.length) % frames.length; setRequirementData(requirementId, { ...data, currentFrameIndex: next }); paintPreviewFrame(requirementId); renderFrames(requirementId); }
function paintPreviewFrame(requirementId) { const data = getRequirementData(requirementId); const frames = data.frames || []; const stage = content()?.querySelector('[data-preview-stage]'); const readout = content()?.querySelector('[data-frame-readout]'); if (!stage) return; const index = clampNumber(data.currentFrameIndex, 0, 0, Math.max(0, frames.length - 1)); if (readout) readout.textContent = `${frames.length ? index + 1 : 0}/${frames.length}`; const frame = frames[index]; stage.innerHTML = frame?.dataUrl ? `<img src="${frame.dataUrl}" style="${correctionStyle(data.correction)}" alt="${escapeHtml(frame.name || 'Preview frame')}" />` : '<span class="hint">Preview appears here.</span>'; }
function updateCorrection(requirementId, key, value) { const data = getRequirementData(requirementId); const correction = { scale: 0, x: 0, y: 0, ...(data.correction || {}), [key]: value }; setRequirementData(requirementId, { ...data, correction }); paintPreviewFrame(requirementId); renderFrames(requirementId); }
function correctionStyle(correction = {}) { const scale = 1 + (Number(correction.scale || 0) / 100); const x = Number(correction.x || 0); const y = Number(correction.y || 0); return `transform:translate(${x}px, ${y}px) scale(${scale});transform-origin:center center;`; }
function matchBrightness(requirementId) { const data = getRequirementData(requirementId); setRequirementData(requirementId, { ...data, notes: appendNote(data.notes, 'Brightness matching requested. Full processing will run when frames are exported.') }); }

function buildRequirements(item) { const reqs = [{ id: 'asset:gameplay_sprite', type: 'asset', actionId: 'gameplay_sprite_asset', label: 'Gameplay Sprite Asset ID', defaultMode: 'sprite_sheet' }, { id: 'asset:dialogue_portrait', type: 'asset', actionId: 'dialogue_portrait_asset', label: 'Dialogue Portrait Asset ID', defaultMode: 'sprite_sheet' }]; (item.animationProfile.gameplayActions || []).forEach((id) => reqs.push({ id: `gameplay:${id}`, type: 'gameplay', actionId: id, label: labelFor(GAMEPLAY_ACTIONS, id), defaultMode: 'sprite_sheet' })); (item.animationProfile.portraitActions || []).forEach((id) => reqs.push({ id: `portrait:${id}`, type: 'portrait', actionId: id, label: labelFor(PORTRAIT_ACTIONS, id), defaultMode: id.includes('overlay') ? 'individual_images' : 'sprite_sheet' })); if (item.behaviour.flags.hasCollision) reqs.push({ id: 'metadata:collision', type: 'metadata', actionId: 'collision', label: 'Collision / Hitbox Check', defaultMode: 'metadata' }); if (item.behaviour.flags.interactable) reqs.push({ id: 'metadata:interaction', type: 'metadata', actionId: 'interaction', label: 'Interaction Prompt / Invoke Setup', defaultMode: 'metadata' }); return orderedRequirements(reqs); }
function ensureProductionAssets(requirements) { const productionAssets = editorState.archetype.productionAssets || { version: VERSION, requirements: {}, requirementOrder: [] }; productionAssets.version = VERSION; productionAssets.requirements = productionAssets.requirements || {}; const ids = requirements.map((req) => req.id); productionAssets.requirementOrder = mergeOrder(productionAssets.requirementOrder || [], ids); requirements.forEach((req) => { productionAssets.requirements[req.id] = { mode: req.defaultMode, spriteSheetAssetId: '', imageAssetIds: '', frames: [], frameCount: '', fps: '', soundAssetId: '', notes: '', complete: false, currentFrameIndex: 0, correction: { scale: 0, x: 0, y: 0 }, ...(productionAssets.requirements[req.id] || {}) }; }); updateArchetype({ productionAssets }); }
function orderedRequirements(requirements) { const order = editorState.archetype.productionAssets?.requirementOrder || []; const byId = new Map(requirements.map((req) => [req.id, req])); return [...order.filter((id) => byId.has(id)).map((id) => byId.get(id)), ...requirements.filter((req) => !order.includes(req.id))]; }
function mergeOrder(existing, ids) { return [...existing.filter((id) => ids.includes(id)), ...ids.filter((id) => !existing.includes(id))]; }
function moveRequirement(fromId, toId, requirements) { if (!fromId || !toId || fromId === toId) return; const orderedIds = orderedRequirements(requirements).map((req) => req.id); const from = orderedIds.indexOf(fromId); const to = orderedIds.indexOf(toId); if (from < 0 || to < 0) return; const [moved] = orderedIds.splice(from, 1); orderedIds.splice(to, 0, moved); updateArchetype({ productionAssets: { requirementOrder: orderedIds } }); renderBuildChecklist(); }
function getRequirementData(id) { return editorState.archetype.productionAssets?.requirements?.[id] || {}; }
function setRequirementData(id, data) { const productionAssets = editorState.archetype.productionAssets || { version: VERSION, requirements: {}, requirementOrder: [] }; productionAssets.requirements = productionAssets.requirements || {}; productionAssets.requirements[id] = data; updateArchetype({ productionAssets }); syncVisualAssetFromTask(id, data); autoSaveWizardSession(); updateProgressOrb(); }
function syncVisualAssetFromTask(id, data) { if (id === 'asset:gameplay_sprite' && data.spriteSheetAssetId) updateArchetype({ visual: { spriteAssetId: data.spriteSheetAssetId } }); if (id === 'asset:dialogue_portrait' && data.spriteSheetAssetId) updateArchetype({ visual: { portraitAssetId: data.spriteSheetAssetId } }); }
function updateRequirement(id, key, value) { setRequirementData(id, { ...getRequirementData(id), [key]: value }); renderRequirementList(buildRequirements(editorState.archetype)); }
function updateProgressOrb() { const orb = document.getElementById('wizard-progress-orb'); if (!orb) return; const requirements = buildRequirements(editorState.archetype); const total = requirements.length; const complete = requirements.filter((req) => getRequirementData(req.id).complete).length; const percent = total ? Math.round((complete / total) * 100) : 0; orb.style.setProperty('--progress', `${percent}%`); orb.querySelector('span').textContent = `${percent}%`; }
function finishWizard(shouldSave) { stopPreview(false); validateCurrentArchetype(); if (shouldSave) saveCurrentLocal(); deleteWizardSession(wizardState.sessionId); document.getElementById('quickstart-dialog')?.close(); window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message: shouldSave ? 'Object setup saved locally.' : 'Object setup checklist added.', type: 'success' } })); }
function saveAndResumeLater() { saveWizardSession(); document.getElementById('quickstart-dialog')?.close(); window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message: 'Wizard saved. Resume it from the 🔮 beside File.', type: 'success' } })); }
function installWizardSessionIndicator() { const menuBar = document.querySelector('.menu-bar'); if (!menuBar || document.getElementById('wizard-session-wrap')) return; const wrap = document.createElement('div'); wrap.id = 'wizard-session-wrap'; wrap.className = 'wizard-session-wrap'; wrap.innerHTML = `<button type="button" class="wizard-session-button" title="Open saved Quick Start wizards">🔮</button><div class="wizard-session-menu"></div>`; menuBar.prepend(wrap); wrap.querySelector('.wizard-session-button').addEventListener('click', () => { wrap.classList.toggle('is-open'); renderWizardSessionMenu(); }); refreshWizardSessionIndicator(); }
function autoSaveWizardSession() { if (wizardState.sessionId) saveWizardSession(false); }
function saveWizardSession(showToast = false) { if (!wizardState.sessionId) wizardState.sessionId = `session_${Date.now().toString(36)}`; const session = { id: wizardState.sessionId, title: editorState.archetype.name || editorState.archetype.id, updatedAt: new Date().toISOString(), selectedRequirementId: wizardState.selectedRequirementId, archetype: editorState.archetype }; try { localStorage.setItem(`${SESSION_PREFIX}${session.id}`, JSON.stringify(session)); } catch {} refreshWizardSessionIndicator(); if (showToast) window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message: 'Wizard saved.', type: 'success' } })); }
function listWizardSessions() { const items = []; for (let index = 0; index < localStorage.length; index += 1) { const key = localStorage.key(index); if (!key?.startsWith(SESSION_PREFIX)) continue; try { items.push(JSON.parse(localStorage.getItem(key))); } catch {} } return items.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))); }
function refreshWizardSessionIndicator() { const wrap = document.getElementById('wizard-session-wrap'); if (!wrap) return; wrap.classList.toggle('has-sessions', listWizardSessions().length > 0); }
function renderWizardSessionMenu() { const menu = document.querySelector('#wizard-session-wrap .wizard-session-menu'); const sessions = listWizardSessions(); if (!sessions.length) { menu.innerHTML = '<p class="hint">No saved wizards.</p>'; return; } menu.innerHTML = ''; sessions.forEach((session) => { const row = document.createElement('div'); row.className = 'wizard-session-row'; row.innerHTML = `<button type="button" data-resume>${escapeHtml(session.title || session.id)}<small>${escapeHtml(new Date(session.updatedAt).toLocaleString())}</small></button><button type="button" data-delete>×</button>`; row.querySelector('[data-resume]').addEventListener('click', () => resumeWizardSession(session.id)); row.querySelector('[data-delete]').addEventListener('click', () => { deleteWizardSession(session.id); renderWizardSessionMenu(); }); menu.appendChild(row); }); }
function resumeWizardSession(id) { const raw = localStorage.getItem(`${SESSION_PREFIX}${id}`); if (!raw) return; const session = JSON.parse(raw); loadArchetype(session.archetype); wizardState.sessionId = session.id; wizardState.selectedRequirementId = session.selectedRequirementId || ''; document.getElementById('wizard-session-wrap')?.classList.remove('is-open'); const dialog = document.getElementById('quickstart-dialog'); if (dialog && !dialog.open) dialog.showModal(); renderBuildChecklist(); }
function deleteWizardSession(id) { if (id) localStorage.removeItem(`${SESSION_PREFIX}${id}`); refreshWizardSessionIndicator(); }
function emojiFor(id) { return EMOJI[id] || '🔹'; }
function labelFor(list, id) { return list.find((item) => item.id === id)?.label || humanize(id); }
function cloneAsNew(data) { const clone = JSON.parse(JSON.stringify(data || {})); const suffix = Date.now().toString(36).slice(-5); clone.id = `${safeId(clone.id || clone.name || 'object_archetype')}_variant_${suffix}`; clone.name = `${clone.name || 'Object Archetype'} Variant`; clone.createdAt = new Date().toISOString(); clone.updatedAt = new Date().toISOString(); return clone; }
function safeId(value) { return String(value || 'object_archetype').trim().toLowerCase().replace(/[^a-z0-9_\-]+/g, '_').replace(/^_+|_+$/g, '') || 'object_archetype'; }
function humanize(value) { return String(value || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function clampNumber(value, fallback, min, max) { const number = Number(value); return Math.min(max, Math.max(min, Number.isFinite(number) ? number : fallback)); }
function appendNote(existing, note) { return existing ? `${existing}\n${note}` : note; }

window.addEventListener('DOMContentLoaded', () => { injectStyles(); installButtonSafety(); installWizard(); });
