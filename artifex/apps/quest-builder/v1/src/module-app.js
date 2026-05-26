import { MODULE_VERSION } from './module-config.js';
import {
  addBlock,
  addQuest,
  deleteBlock,
  deleteQuest,
  getActiveBlock,
  getActiveQuest,
  loadDocument,
  onStateChange,
  resetDocument,
  selectBlock,
  selectQuest,
  state,
  updateBlock,
  updateDocument,
  updateQuest
} from './module-state.js';
import { exportJson, importJsonFile, saveLocal } from './module-io.js';
import { initRenderer } from './module-renderer.js';

let syncing = false;

window.addEventListener('DOMContentLoaded', () => {
  initRenderer();
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

function wireActions() {
  byId('new-file-button')?.addEventListener('click', () => { resetDocument(); toast('New Quest file created.'); });
  byId('add-quest-button')?.addEventListener('click', () => { addQuest(); toast('Quest added.'); });
  byId('delete-quest-button')?.addEventListener('click', () => { deleteQuest(); toast('Quest deleted.'); });
  byId('add-block-button')?.addEventListener('click', () => { addBlock('scene'); toast('Block added.'); });
  byId('delete-block-button')?.addEventListener('click', () => { deleteBlock(); toast('Block deleted.'); });
  byId('export-json-button')?.addEventListener('click', () => { exportJson(); toast('JSON exported.'); });
  byId('import-json-input')?.addEventListener('change', async (event) => {
    try {
      await importJsonFile(event.target.files?.[0]);
      toast('JSON imported.');
    } catch (error) {
      console.error(error);
      toast('Could not import JSON.', 'error');
    } finally {
      event.target.value = '';
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

function renderUI() {
  syncing = true;
  setValue('file-id-input', state.document.id);
  setValue('file-name-input', state.document.name);
  setValue('chronicle-id-input', state.document.defaultChronicleId);

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
