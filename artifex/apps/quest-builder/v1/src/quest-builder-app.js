import { MODULE_VERSION, MODULE_STORAGE_KEY, LAYOUT_STORAGE_KEY, DESIGN_WIDTH, DESIGN_HEIGHT } from './module-config.js';
import { getBlockType } from './block-types.js';
import { createDemoQuestFile, createDefaultQuest, createDefaultBlock, escapeHtml } from './quest-schema.js';
import { createLayoutState, clamp } from './layout-state.js';
import { drawCanvas, applyCanvasTransform, getCanvasHit } from './canvas-renderer.js';
import { fillBlockTypeMenus, wireMenus, wireActions, wireInputs, wireFlowDrag, wireWorkspacePan, wirePanelResize, wireFlowResizeSave } from './ui-bindings.js';

const $ = (id) => document.getElementById(id);

const layoutState = createLayoutState(LAYOUT_STORAGE_KEY);
const doc = createDemoQuestFile();
const canvas = $('module-canvas');
const ctx = canvas.getContext('2d');

const state = {
  mode: 'dark',
  activeQuest: 0,
  activeBlock: 0,
  inspectorTarget: 'quest',
  selectedLocked: false
};

const app = {
  $, doc, canvas, ctx, state, storageKey: MODULE_STORAGE_KEY, layoutState, hitZones: [],
  layout: () => layoutState.get(),
  patchLayout: (patch) => layoutState.patch(patch),
  saveLayout: () => layoutState.save(),
  resetLayout,
  quest: () => doc.quests[state.activeQuest] || null,
  block: () => (doc.quests[state.activeQuest]?.blocks || [])[state.activeBlock] || null,
  meta: getBlockType,
  addQuest,
  addBlock,
  removeQuest,
  removeBlock,
  applyLayout,
  applyCanvasTransform: () => applyCanvasTransform(canvas, layoutState.get()),
  render,
  draw: () => drawCanvas(app),
  toast,
  help,
  selectQuest,
  selectBlock
};

function boot() {
  layoutState.load();
  fillBlockTypeMenus(app);
  wireMenus(app);
  wireActions(app);
  wireInputs(app);
  wireFlowDrag(app);
  wireWorkspacePan(app);
  wirePanelResize(app);
  wireFlowResizeSave(app);
  wireCanvasSelection();
  applyLayout();
  render();
  toast(`Quest Builder ${MODULE_VERSION} loaded.`);
}

function addQuest(patch = {}) {
  doc.quests.push(createDefaultQuest({ chronicleId: doc.defaultChronicleId, ...patch }));
  state.activeQuest = doc.quests.length - 1;
  state.activeBlock = 0;
  state.inspectorTarget = 'quest';
  render();
}

function addBlock(type = 'scene', patch = {}) {
  if (!app.quest()) addQuest();
  app.quest().blocks.push(createDefaultBlock(type, patch));
  state.activeBlock = app.quest().blocks.length - 1;
  state.inspectorTarget = 'block';
  render();
}

function removeQuest() {
  if (!app.quest()) return;
  doc.quests.splice(state.activeQuest, 1);
  state.activeQuest = Math.max(0, Math.min(state.activeQuest, doc.quests.length - 1));
  state.activeBlock = 0;
  state.inspectorTarget = 'quest';
  render();
}

function removeBlock() {
  if (!app.block()) return;
  app.quest().blocks.splice(state.activeBlock, 1);
  state.activeBlock = Math.max(0, Math.min(state.activeBlock, app.quest().blocks.length - 1));
  state.inspectorTarget = 'quest';
  render();
}

function selectQuest(index = state.activeQuest) {
  state.activeQuest = Math.max(0, Math.min(index, doc.quests.length - 1));
  state.activeBlock = Math.max(0, Math.min(state.activeBlock, (app.quest()?.blocks || []).length - 1));
  state.inspectorTarget = 'quest';
  render();
}

function selectBlock(index) {
  const blocks = app.quest()?.blocks || [];
  if (!blocks.length) return selectQuest();
  state.activeBlock = Math.max(0, Math.min(index, blocks.length - 1));
  state.inspectorTarget = 'block';
  render();
}

function wireCanvasSelection() {
  canvas.addEventListener('click', (event) => {
    if (app.layout().panMode) return;
    const hit = getCanvasHit(app, event);
    if (!hit) return;
    if (hit.kind === 'quest') selectQuest(hit.index ?? state.activeQuest);
    if (hit.kind === 'block') selectBlock(hit.index);
  });
}

function applyLayout() {
  const layout = layoutState.get();
  document.documentElement.style.setProperty('--left-w', clamp(layout.leftW, 230, 620) + 'px');
  const flowWindow = $('flow-window');
  flowWindow.style.left = layout.flowX + 'px';
  flowWindow.style.top = layout.flowY + 'px';
  flowWindow.classList.toggle('vertical', !!layout.flowVertical);
  flowWindow.classList.toggle('collapsed', !!layout.flowCollapsed);
  $('toggle-flow-layout-button').textContent = layout.flowVertical ? '⇆' : '⇅';
  $('collapse-flow-button').textContent = layout.flowCollapsed ? '+' : '−';
  $('pan-toggle-button').classList.toggle('is-active', !!layout.panMode);
  if (!layout.flowCollapsed) {
    flowWindow.style.width = layout.flowW + 'px';
    flowWindow.style.height = layout.flowH === 'auto' ? 'auto' : layout.flowH + 'px';
  } else {
    flowWindow.style.width = '220px';
    flowWindow.style.height = '42px';
  }
  app.applyCanvasTransform();
}

function resetLayout() {
  layoutState.reset();
  applyLayout();
}

function render() {
  applyLayout();
  text('version-badge', MODULE_VERSION);
  const q = app.quest();
  const b = app.block();
  text('status-text', q ? 'Editing: ' + q.name : 'Ready.');
  text('block-count', (q?.blocks?.length || 0) + ' blocks');
  text('zoom-readout', Math.round(layoutState.get().zoom * 100) + '%');

  if (q) {
    if (state.inspectorTarget === 'block' && b) renderBlockInspector(b);
    else renderQuestInspector(q);
  }

  renderQuestList();
  renderBlockList();
  drawCanvas(app);
}

function renderQuestInspector(q) {
  text('inspector-title', 'Quest Status');
  text('inspector-kicker', 'QUEST');
  text('inspector-note', 'Click a quest header, Calling pill, or a flow card in the viewing area. This panel edits the selected thing.');
  showQuestFields(true);
  showBlockFields(false);
  set('selected-quest-name', q.name);
  set('selected-quest-type', q.type);
  set('selected-calling', q.callingText);
  set('selected-chronicle', q.chronicleId);
  set('selected-completion', q.completionFlag);
  set('selected-scenes', (q.sceneIds || []).join(', '));
  set('selected-objects', (q.objectIds || []).join(', '));
  if (document.activeElement !== $('quest-thumb-button')) $('quest-thumb-button').textContent = q.thumbnail || '📜';
}

function renderBlockInspector(b) {
  const blockType = getBlockType(b.type);
  const primaryField = blockType.primaryField || 'action';
  text('inspector-title', 'Block Status');
  text('inspector-kicker', `${blockType.name.toUpperCase()} · ${blockType.category || 'custom'}`);
  text('inspector-note', `Primary field: ${primaryField}. Required: ${(blockType.requiredFields || []).join(', ') || 'none'}.`);
  showQuestFields(false);
  showBlockFields(true);
  if (document.activeElement !== $('block-thumb-button')) $('block-thumb-button').textContent = b.thumbnail || blockType.emoji;
  set('selected-block-name', b.name || blockType.name);
  set('selected-block-type', b.type || 'scene');
  set('selected-block-primary', b[primaryField] || '');
  set('selected-block-action', b.action || '');
  set('selected-block-condition', b.condition || '');
  set('selected-block-overlay', b.uiOverlay || '');
  set('selected-block-notes', b.notes || b.capraFeedback || '');
}

function showQuestFields(show) {
  document.querySelectorAll('[data-inspector="quest"]').forEach((element) => element.hidden = !show);
}

function showBlockFields(show) {
  document.querySelectorAll('[data-inspector="block"]').forEach((element) => element.hidden = !show);
}

function renderQuestList() {
  $('quest-list').innerHTML = '';
  doc.quests.forEach((item, index) => {
    const button = document.createElement('button');
    button.className = 'quest-item ' + (index === state.activeQuest && state.inspectorTarget === 'quest' ? 'selected' : '');
    button.title = 'Select quest: ' + (item.name || 'Untitled Quest');
    button.innerHTML = `<span><strong>${escapeHtml((item.thumbnail || '📜') + ' ' + item.name)}</strong><span>${escapeHtml(item.chronicleId)} / ${escapeHtml(item.type)}</span></span><span class="edit-mini" title="Edit this quest">✎</span>`;
    button.onclick = () => selectQuest(index);
    button.querySelector('.edit-mini').onclick = (event) => { event.stopPropagation(); state.activeQuest = index; state.inspectorTarget = 'quest'; document.dispatchEvent(new CustomEvent('quest-builder-edit-quest')); };
    $('quest-list').appendChild(button);
  });
}

function renderBlockList() {
  const q = app.quest();
  $('block-list').innerHTML = '';
  (q?.blocks || []).forEach((item, index) => {
    const blockType = getBlockType(item.type);
    const button = document.createElement('button');
    button.className = 'record-item border-' + escapeHtml(item.type) + ' ' + (index === state.activeBlock && state.inspectorTarget === 'block' ? 'selected' : '');
    button.title = 'Select block: ' + (item.name || blockType.name);
    button.innerHTML = `<span class="block-emoji">${item.thumbnail || blockType.emoji}</span><span><strong>${escapeHtml(item.name || blockType.name)}</strong><span>${escapeHtml(blockType.name)} / ${escapeHtml(item.sceneId || item.objectId || item.dialogueId || item.condition || item.action || 'unlinked')}</span></span><span class="edit-mini" title="Edit this block">✎</span>`;
    button.onclick = () => selectBlock(index);
    button.querySelector('.edit-mini').onclick = (event) => { event.stopPropagation(); state.activeBlock = index; state.inspectorTarget = 'block'; document.dispatchEvent(new CustomEvent('quest-builder-edit-block')); };
    button.ondblclick = () => document.dispatchEvent(new CustomEvent('quest-builder-edit-block'));
    $('block-list').appendChild(button);
  });
}

function set(id, value) {
  const element = $(id);
  if (!element || document.activeElement === element) return;
  const nextValue = value ?? '';
  if (element.value !== nextValue) element.value = nextValue;
}

function text(id, value) {
  const element = $(id);
  if (element) element.textContent = value ?? '';
}

function toast(message) {
  const div = document.createElement('div');
  div.className = 'toast';
  div.textContent = message;
  $('toast-area').appendChild(div);
  setTimeout(() => div.remove(), 2600);
}

function help(title, body) {
  $('help-title').textContent = title;
  $('help-body').innerHTML = body;
  $('help-dialog').showModal();
}

document.addEventListener('quest-builder-edit-quest', () => import('./dialog-editors.js').then(({ openEditor }) => openEditor(app, 'quest')));
document.addEventListener('quest-builder-edit-block', () => import('./dialog-editors.js').then(({ openEditor }) => openEditor(app, 'block')));

boot();
