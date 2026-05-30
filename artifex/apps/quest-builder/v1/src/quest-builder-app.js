import { MODULE_VERSION, MODULE_STORAGE_KEY, LAYOUT_STORAGE_KEY, DESIGN_WIDTH, DESIGN_HEIGHT } from './module-config.js?v=1.2.10';
import { getBlockType } from './block-types.js?v=1.2.10';
import { createDemoQuestFile, createDefaultQuest, createDefaultBlock, createDefaultConnection, escapeHtml } from './quest-schema.js?v=1.2.10';
import { createLayoutState, clamp } from './layout-state.js?v=1.2.10';
import { drawCanvas, applyCanvasTransform, getCanvasHit, getCanvasPoint, getBlockPosition, typeColor, CARD_W, CARD_H } from './canvas-renderer.js?v=1.2.10';
import { fillBlockTypeMenus, wireMenus, wireActions, wireInputs, wireFlowDrag, wireWorkspacePan, wirePanelResize, wireFlowResizeSave } from './ui-bindings.js?v=1.2.10';
import { openEditor } from './dialog-editors.js?v=1.2.10';

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
  selectedLocked: false,
  dragBlockIndex: null,
  canvasBlockDrag: null,
  connectionDrag: null,
  activeConnectionId: null,
  suppressCanvasClick: false
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
  addConnection,
  removeConnection,
  removeQuest,
  removeBlock,
  reorderBlock,
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
  wireCanvasConnections();
  wireCanvasBlockDrag();
  applyLayout();
  render();
  toast(`Quest Builder ${MODULE_VERSION} loaded.`);
}

function addQuest(patch = {}) {
  doc.quests.push(createDefaultQuest({ chronicleId: doc.defaultChronicleId, ...patch }));
  state.activeQuest = doc.quests.length - 1;
  state.activeBlock = 0;
  state.inspectorTarget = 'quest';
  state.activeConnectionId = null;
  render();
}

function addBlock(type = 'scene', patch = {}) {
  if (!app.quest()) addQuest();
  app.quest().blocks.push(createDefaultBlock(type, patch));
  state.activeBlock = app.quest().blocks.length - 1;
  state.inspectorTarget = 'block';
  state.activeConnectionId = null;
  render();
}

function addConnection(sourceNodeId, sourcePort, targetNodeId, targetPort) {
  const quest = app.quest();
  if (!quest || !sourceNodeId || !targetNodeId || sourceNodeId === targetNodeId) return false;
  quest.connections = quest.connections || [];
  const duplicate = quest.connections.some((connection) => connection.sourceNodeId === sourceNodeId && connection.targetNodeId === targetNodeId && connection.sourcePort === sourcePort && connection.targetPort === targetPort);
  if (duplicate) return false;
  const connection = createDefaultConnection(sourceNodeId, targetNodeId, { sourcePort, targetPort });
  quest.connections.push(connection);
  state.activeConnectionId = connection.id;
  render();
  return true;
}

function removeConnection(connectionId = state.activeConnectionId) {
  const quest = app.quest();
  if (!quest || !connectionId) return false;
  const index = (quest.connections || []).findIndex((connection) => connection.id === connectionId);
  if (index < 0) return false;
  quest.connections.splice(index, 1);
  state.activeConnectionId = null;
  render();
  return true;
}

function removeQuest() {
  if (!app.quest()) return;
  doc.quests.splice(state.activeQuest, 1);
  state.activeQuest = Math.max(0, Math.min(state.activeQuest, doc.quests.length - 1));
  state.activeBlock = 0;
  state.inspectorTarget = 'quest';
  state.activeConnectionId = null;
  render();
}

function removeBlock() {
  if (!app.block()) return;
  const removedId = app.block().id;
  app.quest().blocks.splice(state.activeBlock, 1);
  app.quest().connections = (app.quest().connections || []).filter((connection) => connection.sourceNodeId !== removedId && connection.targetNodeId !== removedId);
  state.activeBlock = Math.max(0, Math.min(state.activeBlock, app.quest().blocks.length - 1));
  state.inspectorTarget = 'quest';
  state.activeConnectionId = null;
  render();
}

function reorderBlock(fromIndex, toIndex) {
  const blocks = app.quest()?.blocks || [];
  const from = Number(fromIndex);
  const to = Number(toIndex);
  if (!Number.isInteger(from) || !Number.isInteger(to)) return;
  if (from === to || from < 0 || to < 0 || from >= blocks.length || to >= blocks.length) return;
  const [moved] = blocks.splice(from, 1);
  blocks.splice(to, 0, moved);
  state.activeBlock = to;
  state.inspectorTarget = 'block';
  state.dragBlockIndex = null;
  render();
  toast(`Moved ${moved.name || getBlockType(moved.type).name} in the list. Connections unchanged.`);
}

function selectQuest(index = state.activeQuest) {
  state.activeQuest = Math.max(0, Math.min(index, doc.quests.length - 1));
  state.activeBlock = Math.max(0, Math.min(state.activeBlock, (app.quest()?.blocks || []).length - 1));
  state.inspectorTarget = 'quest';
  state.activeConnectionId = null;
  render();
}

function selectBlock(index) {
  const blocks = app.quest()?.blocks || [];
  if (!blocks.length) return selectQuest();
  state.activeBlock = Math.max(0, Math.min(index, blocks.length - 1));
  state.inspectorTarget = 'block';
  state.activeConnectionId = null;
  render();
}

function openQuestEditor(index = state.activeQuest) {
  selectQuest(index);
  openEditor(app, 'quest');
}

function openBlockEditor(index) {
  selectBlock(index);
  openEditor(app, 'block');
}

function wireCanvasSelection() {
  canvas.addEventListener('click', (event) => {
    if (state.suppressCanvasClick) {
      state.suppressCanvasClick = false;
      return;
    }
    const hit = getCanvasHit(app, event);
    if (!hit) {
      if (state.activeConnectionId) { state.activeConnectionId = null; app.draw(); }
      return;
    }
    if (hit.kind === 'quest-edit') return openQuestEditor(hit.index ?? state.activeQuest);
    if (hit.kind === 'block-edit') return openBlockEditor(hit.index);
    if (hit.kind === 'connection') {
      state.activeConnectionId = hit.connectionId;
      app.draw();
      toast('Connection selected. Press Delete to remove it.');
      return;
    }
    if (hit.kind.startsWith('port-')) return;
    if (app.layout().panMode) return;
    if (hit.kind === 'quest') selectQuest(hit.index ?? state.activeQuest);
    if (hit.kind === 'block') selectBlock(hit.index);
  });
  window.addEventListener('keydown', (event) => {
    if ((event.key === 'Delete' || event.key === 'Backspace') && state.activeConnectionId && !event.target.matches('input, textarea, select')) {
      event.preventDefault();
      if (removeConnection()) toast('Connection removed.');
    }
  });
}

function wireCanvasConnections() {
  canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || app.layout().panMode) return;
    const hit = getCanvasHit(app, event);
    if (!hit || hit.kind !== 'port-out') return;
    event.preventDefault();
    const block = app.quest()?.blocks?.find((item) => item.id === hit.nodeId);
    state.connectionDrag = {
      pointerId: event.pointerId,
      sourceNodeId: hit.nodeId,
      sourcePort: hit.portId,
      color: hit.nodeId === 'START' ? '#7ff0bd' : typeColor(block?.type),
      point: getCanvasPoint(app, event)
    };
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = 'crosshair';
    app.draw();
  });
  canvas.addEventListener('pointermove', (event) => {
    const drag = state.connectionDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    drag.point = getCanvasPoint(app, event);
    app.draw();
  });
  const endConnection = (event) => {
    const drag = state.connectionDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const hit = getCanvasHit(app, event);
    const connected = hit?.kind === 'port-in' && addConnection(drag.sourceNodeId, drag.sourcePort, hit.nodeId, hit.portId);
    state.connectionDrag = null;
    state.suppressCanvasClick = true;
    try { canvas.releasePointerCapture(event.pointerId); } catch { /* noop */ }
    canvas.style.cursor = app.layout().panMode ? 'grab' : 'pointer';
    render();
    toast(connected ? 'Connection created.' : 'Connection cancelled. Drag onto an input circle to connect.');
  };
  canvas.addEventListener('pointerup', endConnection);
  canvas.addEventListener('pointercancel', endConnection);
}

function wireCanvasBlockDrag() {
  canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || app.layout().panMode || state.connectionDrag) return;
    const hit = getCanvasHit(app, event);
    if (!hit || hit.kind !== 'block') return;
    const block = app.quest()?.blocks?.[hit.index];
    if (!block) return;
    const point = getCanvasPoint(app, event);
    const position = getBlockPosition(app.layout(), app.quest().id, block.id, hit.index);
    state.canvasBlockDrag = {
      pointerId: event.pointerId,
      index: hit.index,
      key: `${app.quest().id}:${block.id}`,
      offsetX: point.x - position.x,
      offsetY: point.y - position.y,
      startX: point.x,
      startY: point.y,
      moved: false
    };
    state.activeBlock = hit.index;
    state.inspectorTarget = 'block';
    state.activeConnectionId = null;
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = 'grabbing';
    app.draw();
  });

  canvas.addEventListener('pointermove', (event) => {
    const drag = state.canvasBlockDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const point = getCanvasPoint(app, event);
    if (!drag.moved && Math.hypot(point.x - drag.startX, point.y - drag.startY) < 5) return;
    drag.moved = true;
    const blockPositions = { ...(app.layout().blockPositions || {}) };
    blockPositions[drag.key] = {
      x: Math.round(clamp(point.x - drag.offsetX, 12, DESIGN_WIDTH - CARD_W - 12)),
      y: Math.round(clamp(point.y - drag.offsetY, 158, DESIGN_HEIGHT - CARD_H - 12))
    };
    app.patchLayout({ blockPositions });
    app.draw();
  });

  const endDrag = (event) => {
    const drag = state.canvasBlockDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.moved) {
      app.saveLayout();
      state.suppressCanvasClick = true;
      toast('Workspace card position saved. Connections unchanged.');
    }
    state.canvasBlockDrag = null;
    canvas.style.cursor = app.layout().panMode ? 'grab' : 'pointer';
    try { canvas.releasePointerCapture(event.pointerId); } catch { /* noop */ }
    render();
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
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
  state.activeConnectionId = null;
  applyLayout();
  render();
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
    button.querySelector('.edit-mini').onclick = (event) => { event.stopPropagation(); openQuestEditor(index); };
    $('quest-list').appendChild(button);
  });
}

function clearBlockDragClasses() {
  document.querySelectorAll('#block-list .record-item').forEach((element) => element.classList.remove('dragging', 'drag-over'));
}

function renderBlockList() {
  const q = app.quest();
  $('block-list').innerHTML = '';
  (q?.blocks || []).forEach((item, index) => {
    const blockType = getBlockType(item.type);
    const button = document.createElement('button');
    button.className = 'record-item border-' + escapeHtml(item.type) + ' ' + (index === state.activeBlock && state.inspectorTarget === 'block' ? 'selected' : '');
    button.title = 'Drag to reorder list display, click to select: ' + (item.name || blockType.name);
    button.draggable = true;
    button.dataset.blockIndex = String(index);
    button.innerHTML = `<span class="block-emoji">${item.thumbnail || blockType.emoji}</span><span><strong>${escapeHtml(item.name || blockType.name)}</strong><span>${escapeHtml(blockType.name)} / ${escapeHtml(item.sceneId || item.objectId || item.dialogueId || item.condition || item.action || 'unlinked')}</span></span><span class="drag-mini" title="Drag to reorder list">↕</span><span class="edit-mini" title="Edit this block">✎</span>`;
    button.onclick = () => selectBlock(index);
    button.ondragstart = (event) => {
      state.dragBlockIndex = index;
      state.activeBlock = index;
      state.inspectorTarget = 'block';
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
      button.classList.add('dragging', 'selected');
    };
    button.ondragover = (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      if (state.dragBlockIndex !== null && state.dragBlockIndex !== index) {
        clearBlockDragClasses();
        button.classList.add('drag-over');
      }
    };
    button.ondragleave = () => button.classList.remove('drag-over');
    button.ondrop = (event) => {
      event.preventDefault();
      const from = Number(event.dataTransfer.getData('text/plain') || state.dragBlockIndex);
      clearBlockDragClasses();
      reorderBlock(from, index);
    };
    button.ondragend = () => {
      clearBlockDragClasses();
      state.dragBlockIndex = null;
      render();
    };
    button.querySelector('.edit-mini').onclick = (event) => { event.stopPropagation(); openBlockEditor(index); };
    button.ondblclick = () => openBlockEditor(index);
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
  setTimeout(() => div.remove(), 3000);
}

function help(title, body) {
  $('help-title').textContent = title;
  $('help-body').innerHTML = body;
  $('help-dialog').showModal();
}

boot();
