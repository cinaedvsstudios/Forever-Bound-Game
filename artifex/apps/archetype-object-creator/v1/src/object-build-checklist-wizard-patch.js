import { editorState, updateArchetype, validateCurrentArchetype } from './editor-state.js';
import { saveCurrentLocal } from './editor-io.js';
import { GAMEPLAY_ACTIONS, PORTRAIT_ACTIONS } from './templates.js';

const PATCH_VERSION = '1.06';

const BUILD_CHECKLIST_CSS = `
.wizard-build-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
  margin-top: 14px;
}
.wizard-build-item {
  border: 1px solid rgba(226, 204, 167, 0.28);
  border-radius: 16px;
  background: rgba(18, 13, 11, 0.82);
  overflow: hidden;
}
.wizard-build-summary {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 13px;
  border: 0;
  border-bottom: 1px solid rgba(226, 204, 167, 0.16);
  background: rgba(38, 27, 22, 0.9);
  color: #fff0ce;
  text-align: left;
  cursor: pointer;
}
.wizard-build-summary strong {
  display: block;
  font-size: 14px;
}
.wizard-build-summary span {
  display: block;
  color: rgba(255, 240, 206, 0.68);
  font-size: 11px;
  margin-top: 2px;
}
.wizard-build-summary em {
  flex: 0 0 auto;
  color: #ff7878;
  font-style: normal;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.wizard-build-item.is-complete .wizard-build-summary em {
  color: #b8d56e;
}
.wizard-build-detail {
  display: none;
  padding: 12px;
}
.wizard-build-item.is-open .wizard-build-detail {
  display: grid;
  gap: 10px;
}
.wizard-build-detail label {
  display: grid;
  gap: 5px;
  margin: 0;
}
.wizard-build-detail input,
.wizard-build-detail select,
.wizard-build-detail textarea {
  width: 100%;
}
.wizard-build-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.wizard-build-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}
`;

function injectBuildChecklistStyles() {
  if (document.getElementById('object-build-checklist-wizard-styles')) return;
  const style = document.createElement('style');
  style.id = 'object-build-checklist-wizard-styles';
  style.textContent = BUILD_CHECKLIST_CSS;
  document.head.appendChild(style);
}

function installBuildChecklistInterceptor() {
  document.addEventListener('click', (event) => {
    const finish = event.target.closest('[data-patched-save], [data-patched-finish]');
    if (!finish || !document.getElementById('quickstart-dialog')?.open) return;
    const content = document.getElementById('quickstart-content');
    if (!content?.querySelector('[data-patched-field]')) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    renderBuildChecklist(finish.hasAttribute('data-patched-save'));
  }, true);
}

function renderBuildChecklist(shouldSaveAtEnd = false) {
  const content = document.getElementById('quickstart-content');
  if (!content) return;
  const title = document.getElementById('quickstart-title');
  const step = document.getElementById('quickstart-step-label');
  if (title) title.textContent = 'Quick Start Wizard';
  if (step) step.textContent = 'Step 5: attach the files this object needs';

  const requirements = buildRequirements(editorState.archetype);
  ensureProductionAssets(requirements);

  content.innerHTML = `
    <p class="hint">This checklist gets the object production-ready. Choose sprite sheet or individual images for each action, add the image paths/asset IDs, and assign sounds where needed. You can still tweak everything later in the normal editor.</p>
    <div class="wizard-toolbar">
      <button type="button" data-build-back>Back to basic changes</button>
      <button type="button" data-build-save>Finish + Save Local</button>
      <button type="button" data-build-finish>Finish</button>
    </div>
    <div class="wizard-build-list"></div>
  `;

  const list = content.querySelector('.wizard-build-list');
  requirements.forEach((requirement) => list.appendChild(createRequirementCard(requirement)));
  content.querySelector('[data-build-back]')?.addEventListener('click', () => document.querySelector('[data-patched-next]')?.click());
  content.querySelector('[data-build-save]')?.addEventListener('click', () => finishBuildChecklist(true));
  content.querySelector('[data-build-finish]')?.addEventListener('click', () => finishBuildChecklist(shouldSaveAtEnd));
}

function buildRequirements(item) {
  const requirements = [];
  for (const actionId of item.animationProfile.gameplayActions || []) {
    const action = GAMEPLAY_ACTIONS.find((entry) => entry.id === actionId) || { id: actionId, label: humanize(actionId) };
    requirements.push({ id: `gameplay:${action.id}`, type: 'gameplay', actionId: action.id, label: action.label, defaultMode: 'sprite_sheet', needsSound: actionNeedsSound(action.id) });
  }
  for (const actionId of item.animationProfile.portraitActions || []) {
    const action = PORTRAIT_ACTIONS.find((entry) => entry.id === actionId) || { id: actionId, label: humanize(actionId) };
    requirements.push({ id: `portrait:${action.id}`, type: 'portrait', actionId: action.id, label: action.label, defaultMode: action.id.includes('overlay') ? 'individual_images' : 'sprite_sheet', needsSound: action.id === 'mouth_loop' });
  }
  if (item.behaviour?.flags?.hasCollision) requirements.push({ id: 'metadata:collision', type: 'metadata', actionId: 'collision', label: 'Collision / Hitbox Check', defaultMode: 'metadata', needsSound: false });
  if (item.behaviour?.flags?.interactable) requirements.push({ id: 'metadata:interaction', type: 'metadata', actionId: 'interaction', label: 'Interaction Prompt / Invoke Setup', defaultMode: 'metadata', needsSound: true });
  return requirements;
}

function ensureProductionAssets(requirements) {
  const existing = editorState.archetype.productionAssets || { version: PATCH_VERSION, requirements: {} };
  existing.version = PATCH_VERSION;
  existing.requirements = existing.requirements || {};
  for (const requirement of requirements) {
    existing.requirements[requirement.id] = {
      mode: requirement.defaultMode,
      spriteSheetAssetId: '',
      imageAssetIds: '',
      frameCount: '',
      fps: '',
      soundAssetId: '',
      notes: '',
      complete: false,
      ...(existing.requirements[requirement.id] || {})
    };
  }
  updateArchetype({ productionAssets: existing });
}

function createRequirementCard(requirement) {
  const data = editorState.archetype.productionAssets?.requirements?.[requirement.id] || {};
  const card = document.createElement('article');
  card.className = `wizard-build-item ${data.complete ? 'is-complete' : ''}`;
  card.dataset.requirementId = requirement.id;
  card.innerHTML = `
    <button type="button" class="wizard-build-summary">
      <span><strong>${escapeHtml(requirement.label)}</strong><span>${escapeHtml(requirement.type)} · ${escapeHtml(requirement.actionId)}</span></span>
      <em>${data.complete ? 'Ready' : 'Needed'}</em>
    </button>
    <div class="wizard-build-detail">
      <label>Asset style
        <select data-build-field="mode">
          <option value="sprite_sheet">Sprite sheet</option>
          <option value="individual_images">Individual images</option>
          <option value="metadata">Metadata / no image</option>
        </select>
      </label>
      <label>Sprite sheet asset/path<input data-build-field="spriteSheetAssetId" placeholder="assets/characters/mel/mel_walk_sheet.png" /></label>
      <label>Individual image paths / asset IDs<textarea data-build-field="imageAssetIds" rows="3" placeholder="one image per frame or comma-separated list"></textarea></label>
      <div class="wizard-build-row">
        <label>Frame count<input data-build-field="frameCount" type="number" min="0" placeholder="4" /></label>
        <label>FPS<input data-build-field="fps" type="number" min="0" placeholder="8" /></label>
      </div>
      <label>Sound asset/path<input data-build-field="soundAssetId" placeholder="assets/audio/sfx/jump.ogg" /></label>
      <label>Notes<textarea data-build-field="notes" rows="2" placeholder="alignment, frame order, special rules"></textarea></label>
      <label class="wizard-check-row"><span>Mark this requirement complete</span><input data-build-field="complete" type="checkbox" /></label>
    </div>
  `;

  const summary = card.querySelector('.wizard-build-summary');
  summary.addEventListener('click', () => card.classList.toggle('is-open'));

  card.querySelectorAll('[data-build-field]').forEach((field) => {
    const key = field.dataset.buildField;
    if (field.type === 'checkbox') field.checked = Boolean(data[key]);
    else field.value = data[key] ?? '';
    if (key === 'mode') field.value = data[key] || requirement.defaultMode;
    field.addEventListener('input', () => updateRequirement(requirement.id, key, field.type === 'checkbox' ? field.checked : field.value, card));
    field.addEventListener('change', () => updateRequirement(requirement.id, key, field.type === 'checkbox' ? field.checked : field.value, card));
  });

  return card;
}

function updateRequirement(requirementId, key, value, card) {
  const productionAssets = editorState.archetype.productionAssets || { version: PATCH_VERSION, requirements: {} };
  productionAssets.requirements = productionAssets.requirements || {};
  productionAssets.requirements[requirementId] = {
    ...(productionAssets.requirements[requirementId] || {}),
    [key]: value
  };
  updateArchetype({ productionAssets });
  if (key === 'complete') {
    card.classList.toggle('is-complete', Boolean(value));
    const badge = card.querySelector('.wizard-build-summary em');
    if (badge) badge.textContent = value ? 'Ready' : 'Needed';
  }
}

function finishBuildChecklist(shouldSave) {
  validateCurrentArchetype();
  if (shouldSave) saveCurrentLocal();
  document.getElementById('quickstart-dialog')?.close();
  window.dispatchEvent(new CustomEvent('artifex:toast', {
    detail: { message: shouldSave ? 'Object setup checklist saved locally.' : 'Object setup checklist added.', type: 'success' }
  }));
}

function actionNeedsSound(actionId) {
  return ['jump', 'pickup', 'throw', 'use_item', 'sing_cast', 'cast_ritual', 'attack', 'special_attack', 'take_damage', 'death', 'enter_door', 'exit_door', 'open', 'close', 'collect', 'searched_open', 'activate', 'trigger', 'land_break'].includes(actionId);
}

function humanize(value) {
  return String(value || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

window.addEventListener('DOMContentLoaded', () => {
  injectBuildChecklistStyles();
  installBuildChecklistInterceptor();
});
