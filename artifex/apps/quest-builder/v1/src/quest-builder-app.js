import { MODULE_VERSION, MODULE_STORAGE_KEY, LAYOUT_STORAGE_KEY, DESIGN_WIDTH, DESIGN_HEIGHT } from './module-config.js';
import { getBlockType } from './block-types.js';
import { createDemoQuestFile, createDefaultQuest, createDefaultBlock, escapeHtml } from './quest-schema.js';
import { createLayoutState, clamp } from './layout-state.js';
import { drawCanvas, applyCanvasTransform } from './canvas-renderer.js';
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
  selectedLocked: false
};

const app = {
  $, doc, canvas, ctx, state, storageKey: MODULE_STORAGE_KEY, layoutState,
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
  help
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
  applyLayout();
  render();
  toast(`Quest Builder ${MODULE_VERSION} loaded.`);
}

function addQuest(patch = {}) {
  doc.quests.push(createDefaultQuest({ chronicleId: doc.defaultChronicleId, ...patch }));
  state.activeQuest = doc.quests.length - 1;
  state.activeBlock = 0;
  render();
}

function addBlock(type = 'scene', patch = {}) {
  if (!app.quest()) addQuest();
  app.quest().blocks.push(createDefaultBlock(type, patch));
  state.activeBlock = app.quest().blocks.length - 1;
  render();
}

function removeQuest() {
  if (!app.quest()) return;
  doc.quests.splice(state.activeQuest, 1);
  state.activeQuest = Math.max(0, Math.min(state.activeQuest, doc.quests.length - 1));
  state.activeBlock = 0;
  render();
}

function removeBlock() {
  if (!app.block()) return;
  app.quest().blocks.splice(state.activeBlock, 1);
  state.activeBlock = Math.max(0, Math.min(state.activeBlock, app.quest().blocks.length - 1));
  render();
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
  text('status-text', q ? 'Editing: ' + q.name : 'Ready.');
  text('block-count', (q?.blocks?.length || 0) + ' blocks');
  text('zoom-readout', Math.round(layoutState.get().zoom * 100) + '%');

  if (q) {
    set('selected-quest-name', q.name);
    set('selected-quest-type', q.type);
    set('selected-calling', q.callingText);
    set('selected-chronicle', q.chronicleId);
    set('selected-completion', q.completionFlag);
    set('selected-scenes', (q.sceneIds || []).join(', '));
    set('selected-objects', (q.objectIds || []).join(', '));
    if (document.activeElement !== $('quest-thumb-button')) $('quest-thumb-button').textContent = q.thumbnail || '📜';
  }

  renderQuestList();
  renderBlockList();
  drawCanvas(app);
}

function renderQuestList() {
  $('quest-list').innerHTML = '';
  doc.quests.forEach((item, index) => {
    const button = document.createElement('button');
    button.className = 'quest-item ' + (index === state.activeQuest ? 'selected' : '');
    button.title = 'Select quest: ' + (item.name || 'Untitled Quest');
    button.innerHTML = `<span><strong>${escapeHtml((item.thumbnail || '📜') + ' ' + item.name)}</strong><span>${escapeHtml(item.chronicleId)} / ${escapeHtml(item.type)}</span></span><span class="edit-mini" title="Edit this quest">✎</span>`;
    button.onclick = () => { state.activeQuest = index; state.activeBlock = 0; render(); };
    button.querySelector('.edit-mini').onclick = (event) => { event.stopPropagation(); state.activeQuest = index; document.dispatchEvent(new CustomEvent('quest-builder-edit-quest')); };
    $('quest-list').appendChild(button);
  });
}

function renderBlockList() {
  const q = app.quest();
  $('block-list').innerHTML = '';
  (q?.blocks || []).forEach((item, index) => {
    const blockType = getBlockType(item.type);
    const button = document.createElement('button');
    button.className = 'record-item border-' + escapeHtml(item.type) + ' ' + (index === state.activeBlock ? 'selected' : '');
    button.title = 'Select block: ' + (item.name || blockType.name);
    button.innerHTML = `<span class="block-emoji">${item.thumbnail || blockType.emoji}</span><span><strong>${escapeHtml(item.name || blockType.name)}</strong><span>${escapeHtml(blockType.name)} / ${escapeHtml(item.sceneId || item.objectId || item.dialogueId || item.condition || 'unlinked')}</span></span><span class="edit-mini" title="Edit this block">✎</span>`;
    button.onclick = () => { state.activeBlock = index; render(); };
    button.querySelector('.edit-mini').onclick = (event) => { event.stopPropagation(); state.activeBlock = index; document.dispatchEvent(new CustomEvent('quest-builder-edit-block')); };
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
