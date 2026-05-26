import { MODULE_VERSION } from './module-config.js?v=qb-v1-0-1-20260526d';
import {
  addBlock,
  addQuest,
  deleteBlock,
  deleteQuest,
  getActiveBlock,
  getActiveQuest,
  onStateChange,
  resetDocument,
  selectBlock,
  selectQuest,
  state,
  updateBlock,
  updateDocument,
  updateQuest
} from './module-state.js?v=qb-v1-0-1-20260526d';
import { exportJson, importJsonFile, saveLocal } from './module-io.js?v=qb-v1-0-1-20260526d';
import { initRenderer } from './module-renderer.js?v=qb-v1-0-1-20260526d';

let syncing = false;

window.addEventListener('DOMContentLoaded', () => {
  initRenderer();
  wireMenus();
  wireActions();
  wireInputs();
  onStateChange(renderUI);

  addQuest({
    name: 'Recover the Chalice',
    callingText: 'Find the true chalice and bring it to the altar.',
    completionFlag: 'chalice_delivered',
    sceneIds: ['scene_church', 'scene_crypt'],
    objectIds: ['npc_vitus', 'relic_chalice', 'altar'],
    codiceUpdates: ['codice_chalice_truth'],
    rewards: ['silver:20', 'unlock:route_bridge'],
    blocks: [
      { name: 'Enter Church', type: 'scene', sceneId: 'scene_church', action: 'set_flag:church_entered' },
      { name: 'Speak With Vitus', type: 'dialogue', objectId: 'npc_vitus', dialogueId: 'ch01_q03_vitus_warning' },
      { name: 'Collect Chalice', type: 'object', objectId: 'relic_chalice', action: 'set_flag:chalice_collected' },
      { name: 'Wrong Cup Warning', type: 'capra', condition: 'wrong_item_used', uiOverlay: 'capra_popup', capraFeedback: 'That is not the vessel the Calling seeks.' },
      { name: 'Update Codice', type: 'codice', action: 'unlock_codice:codice_chalice_truth' },
      { name: 'Calling Fulfilled', type: 'completion', condition: 'flag_true:chalice_delivered', uiOverlay: 'calling_fulfilled' }
    ]
  });

  toast(`Quest Builder ${MODULE_VERSION} loaded.`);
});

function wireMenus() {
  document.querySelectorAll('.menu-button').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const panel = byId(`menu-${button.dataset.menu}`);
      const isOpen = panel?.classList.contains('open');
      closeMenus();
      if (panel && !isOpen) panel.classList.add('open');
    });
  });

  document.querySelectorAll('.menu-panel').forEach((panel) => {
    panel.addEventListener('click', (event) => event.stopPropagation());
  });

  document.addEventListener('click', closeMenus);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenus();
  });
}

function closeMenus() {
  document.querySelectorAll('.menu-panel.open').forEach((panel) => panel.classList.remove('open'));
}

function wireActions() {
  byId('new-file-button')?.addEventListener('click', () => { resetDocument(); closeMenus(); toast('New Quest file created.'); });
  byId('save-local-button')?.addEventListener('click', () => { saveLocal(); closeMenus(); toast('Saved locally in this browser.'); });
  byId('add-quest-button')?.addEventListener('click', () => { addQuest(); closeMenus(); openEditor('quest'); toast('Quest added.'); });
  byId('side-add-quest-button')?.addEventListener('click', () => { addQuest(); openEditor('quest'); toast('Quest added.'); });
  byId('edit-quest-button')?.addEventListener('click', () => { closeMenus(); openEditor('quest'); });
  byId('side-edit-quest-button')?.addEventListener('click', () => openEditor('quest'));
  byId('delete-quest-button')?.addEventListener('click', () => { deleteQuest(); closeMenus(); toast('Quest deleted.'); });
  byId('side-add-block-button')?.addEventListener('click', () => { addBlock('scene'); openEditor('block'); toast('Block added.'); });
  byId('edit-block-button')?.addEventListener('click', () => { closeMenus(); openEditor('block'); });
  byId('delete-block-button')?.addEventListener('click', () => { deleteBlock(); closeMenus(); toast('Block deleted.'); });
  byId('edit-file-button')?.addEventListener('click', () => openEditor('file'));
  byId('save-editor-button')?.addEventListener('click', () => toast('Saved.'));

  document.querySelectorAll('[data-add-block]').forEach((button) => {
    button.addEventListener('click', () => {
      addBlock(button.dataset.addBlock || 'scene');
      closeMenus();
      openEditor('block');
      toast('Block added.');
    });
  });

  byId('template-main-quest-button')?.addEventListener('click', () => {
    addQuest({
      name: 'New Main Quest',
      type: 'main',
      callingText: 'Define the main Calling for this Quest.',
      blocks: [
        { name: 'Start Scene', type: 'scene' },
        { name: 'Key Interaction', type: 'object' },
        { name: 'Completion', type: 'completion', uiOverlay: 'calling_fulfilled' }
      ]
    });
    closeMenus();
    openEditor('quest');
    toast('Main Quest template added.');
  });

  byId('template-side-quest-button')?.addEventListener('click', () => {
    addQuest({
      name: 'New Side Quest',
      type: 'side',
      callingText: 'Define the optional objective or Errand.',
      blocks: [
        { name: 'Optional Trigger', type: 'condition' },
        { name: 'Reward', type: 'reward' }
      ]
    });
    closeMenus();
    openEditor('quest');
    toast('Side Quest template added.');
  });

  byId('export-json-button')?.addEventListener('click', () => { exportJson(); closeMenus(); toast('JSON exported.'); });
  byId('view-json-button')?.addEventListener('click', () => { closeMenus(); byId('json-dialog')?.showModal(); });
  byId('library-note-button')?.addEventListener('click', () => { closeMenus(); showHelp('Linked Libraries', '<p>Quest Builder will reference completed scenes, archetype objects, dialogue IDs, Capra popup templates, Codice entries, UI overlays, rewards, and route unlocks. It should not own those libraries directly.</p>'); });
  byId('quick-start-button')?.addEventListener('click', () => { closeMenus(); showHelp('Quick Start', '<p>Select a Quest on the left, use the horizontal Quest Flow strip to select a block, then use Edit or Templates to open the popup editor. Press Save to close the popup.</p>'); });
  byId('about-button')?.addEventListener('click', () => { closeMenus(); showHelp('About Quest Builder', '<p>Quest Builder assembles scenes, archetype objects, dialogue, Capra feedback, Codice updates, UI overlays, rewards, and completion flags into playable Quest flow.</p>'); });

  byId('import-json-input')?.addEventListener('change', async (event) => {
    try {
      await importJsonFile(event.target.files?.[0]);
      toast('JSON imported.');
    } catch (error) {
      console.error(error);
      toast('Could not import JSON.', 'error');
    } finally {
      event.target.value = '';
      closeMenus();
    }
  });
}

function wireInputs() {
  bind('file-id-input', (value) => updateDocument({ id: value || state.document.id }));
  bind('file-name-input', (value) => updateDocument({ name: value || 'Untitled Quest File' }));
  bind('chronicle-id-input', (value) => updateDocument({ defaultChronicleId: value || 'chronicle_01' }));

  bind('quest-name-input', (value) => updateQuest({ name: value || 'New Quest' }));
  bind('quest-type-input', (value) => updateQuest({ type: value || 'main' }));
  bind('calling-text-input', (value) => updateQuest({ callingText: value }));
  bind('quest-scenes-input', (value) => updateQuest({ sceneIds: value }));
  bind('quest-objects-input', (value) => updateQuest({ objectIds: value }));
  bind('completion-flag-input', (value) => updateQuest({ completionFlag: value }));
  bind('quest-rewards-input', (value) => updateQuest({ rewards: value }));
  bind('quest-codice-input', (value) => updateQuest({ codiceUpdates: value }));
  bind('quest-notes-input', (value) => updateQuest({ notes: value }));

  bind('block-name-input', (value) => updateBlock({ name: value || 'Quest Block' }));
  bind('block-type-input', (value) => updateBlock({ type: value || 'scene' }));
  bind('block-scene-input', (value) => updateBlock({ sceneId: value }));
  bind('block-object-input', (value) => updateBlock({ objectId: value }));
  bind('block-dialogue-input', (value) => updateBlock({ dialogueId: value }));
  bind('block-condition-input', (value) => updateBlock({ condition: value }));
  bind('block-action-input', (value) => updateBlock({ action: value }));
  bind('block-overlay-input', (value) => updateBlock({ uiOverlay: value }));
  bind('block-capra-input', (value) => updateBlock({ capraFeedback: value }));
  bind('block-notes-input', (value) => updateBlock({ notes: value }));
}

function bind(id, handler) {
  byId(id)?.addEventListener('input', (event) => {
    if (!syncing) handler(event.target.value);
  });
}

function openEditor(mode) {
  if (mode === 'quest' && !getActiveQuest()) addQuest();
  if (mode === 'block' && !getActiveBlock()) addBlock('scene');

  setText('editor-title', mode === 'file' ? 'Edit Quest File' : mode === 'quest' ? 'Edit Quest' : 'Edit Quest Block');
  document.querySelectorAll('.editor-section').forEach((section) => section.classList.remove('is-active'));
  byId(`${mode}-editor`)?.classList.add('is-active');
  byId('editor-dialog')?.showModal();
}

function showHelp(title, html) {
  setText('help-title', title);
  const body = byId('help-body');
  if (body) body.innerHTML = html;
  byId('help-dialog')?.showModal();
}

function renderUI() {
  syncing = true;
  setValue('file-id-input', state.document.id);
  setValue('file-name-input', state.document.name);
  setValue('chronicle-id-input', state.document.defaultChronicleId);
  setText('file-summary-name', state.document.name);
  setText('file-summary-meta', state.document.defaultChronicleId);

  const quest = getActiveQuest();
  setValue('quest-name-input', quest?.name || '');
  setValue('quest-type-input', quest?.type || 'main');
  setValue('calling-text-input', quest?.callingText || '');
  setValue('quest-scenes-input', quest?.sceneIds?.join(', ') || '');
  setValue('quest-objects-input', quest?.objectIds?.join(', ') || '');
  setValue('completion-flag-input', quest?.completionFlag || '');
  setValue('quest-rewards-input', quest?.rewards?.join(', ') || '');
  setValue('quest-codice-input', quest?.codiceUpdates?.join(', ') || '');
  setValue('quest-notes-input', quest?.notes || '');
  setText('calling-summary', quest?.callingText || 'Select a Quest to view its Calling.');

  const block = getActiveBlock();
  setValue('block-name-input', block?.name || '');
  setValue('block-type-input', block?.type || 'scene');
  setValue('block-scene-input', block?.sceneId || '');
  setValue('block-object-input', block?.objectId || '');
  setValue('block-dialogue-input', block?.dialogueId || '');
  setValue('block-condition-input', block?.condition || '');
  setValue('block-action-input', block?.action || '');
  setValue('block-overlay-input', block?.uiOverlay || '');
  setValue('block-capra-input', block?.capraFeedback || '');
  setValue('block-notes-input', block?.notes || '');

  renderQuestList();
  renderBlockList();
  setText('json-preview', JSON.stringify(state.document, null, 2));
  setText('status-text', quest ? `Editing ${quest.name}` : 'Ready.');
  syncing = false;
}

function renderQuestList() {
  const list = byId('quest-list');
  if (!list) return;
  list.innerHTML = '';
  state.document.quests.forEach((quest, index) => {
    const item = document.createElement('button');
    item.className = `quest-item ${index === state.activeQuestIndex ? 'selected' : ''}`;
    item.innerHTML = `<strong>${escapeHtml(quest.name)}</strong><span>${escapeHtml(quest.chronicleId)} / ${escapeHtml(quest.type)}</span>`;
    item.addEventListener('click', () => selectQuest(index));
    item.addEventListener('dblclick', () => openEditor('quest'));
    list.appendChild(item);
  });
}

function renderBlockList() {
  const list = byId('block-list');
  const quest = getActiveQuest();
  if (!list) return;
  list.innerHTML = '';
  setText('block-count', `${quest?.blocks?.length || 0} blocks`);
  (quest?.blocks || []).forEach((block, index) => {
    const item = document.createElement('button');
    item.className = `record-item ${index === state.activeBlockIndex ? 'selected' : ''}`;
    item.innerHTML = `<strong>${escapeHtml(block.name)}</strong><span>${escapeHtml(block.type)} / ${escapeHtml(block.sceneId || block.objectId || block.dialogueId || block.condition || 'unlinked')}</span>`;
    item.addEventListener('click', () => selectBlock(index));
    item.addEventListener('dblclick', () => openEditor('block'));
    list.appendChild(item);
  });
}

function toast(message, type = 'success') {
  const area = byId('toast-area');
  if (!area) return;
  const item = document.createElement('div');
  item.className = `toast ${type}`;
  item.textContent = message;
  area.appendChild(item);
  setTimeout(() => item.remove(), 2600);
}

function byId(id) { return document.getElementById(id); }
function setValue(id, value) { const el = byId(id); if (el) el.value = value ?? ''; }
function setText(id, value) { const el = byId(id); if (el) el.textContent = value ?? ''; }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char])); }
