import { parseList } from './quest-schema.js?v=1.2.11';

export function openEditor(app, which) {
  if (which === 'quest' && !app.quest()) app.addQuest();
  if (which === 'block' && !app.block()) app.addBlock();

  document.querySelectorAll('.editor-section').forEach((section) => section.classList.remove('is-active'));
  app.$(which + '-editor')?.classList.add('is-active');
  app.$('editor-title').textContent = which === 'file' ? 'Edit Quest File' : which === 'quest' ? 'Edit Quest' : 'Edit Quest Block';
  setEditorTab(which === 'block' ? 'basics' : 'quest-basics');
  fillEditorInputs(app);
  app.$('editor-dialog').showModal();
}

export function wireEditorTabs() {
  document.querySelectorAll('[data-editor-tab]').forEach((button) => {
    button.addEventListener('click', () => setEditorTab(button.dataset.editorTab));
  });
}

function setEditorTab(tab) {
  document.querySelectorAll('[data-editor-tab]').forEach((button) => button.classList.toggle('is-active', button.dataset.editorTab === tab));
  document.querySelectorAll('[data-editor-panel]').forEach((panel) => panel.classList.toggle('is-active', panel.dataset.editorPanel === tab));
}

export function fillEditorInputs(app) {
  const { doc } = app;
  set(app, 'file-id-input', doc.id);
  set(app, 'file-name-input', doc.name);
  set(app, 'chronicle-id-input', doc.defaultChronicleId);

  const q = app.quest() || {};
  set(app, 'quest-thumb-input', q.thumbnail || '📜');
  set(app, 'quest-name-input', q.name);
  set(app, 'quest-type-input', q.type || 'main');
  set(app, 'calling-text-input', q.callingText);
  set(app, 'quest-scenes-input', (q.sceneIds || []).join(', '));
  set(app, 'quest-objects-input', (q.objectIds || []).join(', '));
  set(app, 'completion-flag-input', q.completionFlag);
  set(app, 'quest-rewards-input', (q.rewards || []).join(', '));
  set(app, 'quest-codice-input', (q.codiceUpdates || []).join(', '));
  set(app, 'quest-notes-input', q.notes);

  const b = app.block() || {};
  const meta = app.meta(b.type);
  app.$('editor-thumb').textContent = b.thumbnail || meta.emoji;
  set(app, 'block-thumb-input', b.thumbnail || meta.emoji);
  set(app, 'block-name-input', b.name || '');
  set(app, 'block-type-input', b.type || 'scene');
  set(app, 'block-scene-input', b.sceneId || '');
  set(app, 'block-object-input', b.objectId || '');
  set(app, 'block-dialogue-input', b.dialogueId || '');
  set(app, 'block-audio-input', b.audioId || '');
  set(app, 'block-condition-input', b.condition || '');
  set(app, 'block-action-input', b.action || '');
  set(app, 'block-overlay-input', b.uiOverlay || '');
  set(app, 'block-capra-input', b.capraFeedback || '');
  set(app, 'block-notes-input', b.notes || '');
}

export function createWizardQuest(app) {
  const sceneId = app.$('wizard-scene-input').value.trim();
  const objectId = app.$('wizard-object-input').value.trim();
  const completionFlag = app.$('wizard-flag-input').value.trim();
  app.addQuest({
    name: app.$('wizard-name-input').value.trim() || 'New Quest',
    type: app.$('wizard-type-input').value || 'main',
    callingText: app.$('wizard-calling-input').value.trim() || 'Define what the player needs to do.',
    sceneIds: parseList(sceneId),
    objectIds: parseList(objectId),
    completionFlag,
    blocks: wizardBlocks(app.$('wizard-flow-input').value, sceneId, objectId, completionFlag)
  });
  app.toast('Quest created with loose blocks. Drag the link icon on a card to define the flow.');
}

function wizardBlocks(flow, sceneId, objectId, flag) {
  const start = { name: 'Start Scene', type: 'scene', thumbnail: '🖼️', sceneId };
  const done = { name: 'Calling Fulfilled', type: 'completion', thumbnail: '✅', condition: flag ? 'flag_true:' + flag : '', uiOverlay: 'calling_fulfilled' };
  if (flow === 'dialogue') return [start, { name: 'Speak With Character', type: 'action', thumbnail: '👉', objectId, dialogueId: '', action: objectId ? 'speak:' + objectId : 'speak:npc_id' }, { name: 'Linked Dialogue', type: 'dialogue', thumbnail: '💬', objectId, dialogueId: '' }, done];
  if (flow === 'puzzle') return [start, { name: 'Find Clue', type: 'information', thumbnail: '🔎', sceneId, action: 'discover:clue' }, { name: 'Check Requirement', type: 'condition', thumbnail: '🔀', condition: 'flag_true:clue_found' }, { name: 'Capra Hint', type: 'capra', thumbnail: '🐐', capraFeedback: 'Capra gives a hint.', uiOverlay: 'capra_popup' }, done];
  if (flow === 'combat') return [start, { name: 'Defeat Foe', type: 'combat', thumbnail: '⚔️', sceneId, action: 'defeat:foe_id' }, { name: 'Reward', type: 'reward', thumbnail: '🎁', action: 'grant_reward:silver' }, done];
  return [start, { name: 'Key Interaction', type: 'object', thumbnail: '🧩', objectId, action: objectId ? 'interact:' + objectId : 'interact:object_id' }, done];
}

function set(app, id, value) {
  const element = app.$(id);
  if (element) element.value = value ?? '';
}
