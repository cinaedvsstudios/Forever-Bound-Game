import { THUMBNAILS } from './module-config.js';
import { BLOCK_TYPES } from './block-types.js';
import { parseList, escapeHtml } from './quest-schema.js';
import { openEditor, createWizardQuest } from './dialog-editors.js';
import { exportQuestFile, downloadJson, slugify } from './export-json.js';
import { clamp } from './layout-state.js';

export function wireMenus(app) {
  document.querySelectorAll('.menu-button').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const panel = app.$('menu-' + button.dataset.menu);
      const isOpen = panel?.classList.contains('open');
      closeMenus();
      if (panel && !isOpen) panel.classList.add('open');
    });
  });
  document.querySelectorAll('.menu-panel').forEach((panel) => panel.addEventListener('click', (event) => event.stopPropagation()));
  document.addEventListener('click', closeMenus);
}

export function closeMenus() {
  document.querySelectorAll('.menu-panel.open').forEach((panel) => panel.classList.remove('open'));
}

export function fillBlockTypeMenus(app) {
  const menu = app.$('block-type-menu');
  const popupSelect = app.$('block-type-input');
  const inspectorSelect = app.$('selected-block-type');
  const options = Object.entries(BLOCK_TYPES).map(([key, item]) => `<option value="${key}">${item.emoji} ${item.name}</option>`).join('');
  if (menu) {
    menu.innerHTML = Object.entries(BLOCK_TYPES)
      .map(([key, item]) => `<button type="button" data-add-block="${key}" title="${escapeHtml(item.hint)}">${item.emoji} ${item.name}<small>${item.hint}</small></button>`)
      .join('');
  }
  if (popupSelect) popupSelect.innerHTML = options;
  if (inspectorSelect) inspectorSelect.innerHTML = options;
}

export function wirePanelResize(app) {
  const grip = app.$('panel-resizer');
  let dragging = false;
  let startX = 0;
  let startW = 0;
  grip.addEventListener('pointerdown', (event) => {
    dragging = true;
    startX = event.clientX;
    startW = app.layout().leftW;
    document.body.style.cursor = 'col-resize';
    grip.setPointerCapture(event.pointerId);
  });
  grip.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    app.patchLayout({ leftW: clamp(startW + event.clientX - startX, 230, 620) });
    app.applyLayout();
  });
  grip.addEventListener('pointerup', (event) => {
    if (!dragging) return;
    dragging = false;
    document.body.style.cursor = '';
    app.saveLayout();
    try { grip.releasePointerCapture(event.pointerId); } catch { /* noop */ }
  });
}

export function wireFlowResizeSave(app) {
  new ResizeObserver(() => {
    const windowEl = app.$('flow-window');
    if (windowEl.classList.contains('collapsed')) return;
    const rect = windowEl.getBoundingClientRect();
    app.patchLayout({ flowW: Math.round(rect.width), flowH: Math.round(rect.height) });
    app.saveLayout();
  }).observe(app.$('flow-window'));
}

export function wireFlowDrag(app) {
  const win = app.$('flow-window');
  const handle = app.$('flow-window-header');
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let baseX = 0;
  let baseY = 0;
  handle.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button')) return;
    event.preventDefault();
    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    baseX = app.layout().flowX;
    baseY = app.layout().flowY;
    win.classList.add('dragging');
    document.body.style.cursor = 'grabbing';
  });
  window.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    event.preventDefault();
    app.patchLayout({
      flowX: clamp(baseX + event.clientX - startX, -win.offsetWidth + 70, window.innerWidth - 70),
      flowY: clamp(baseY + event.clientY - startY, 0, window.innerHeight - 42)
    });
    app.applyLayout();
  }, { passive: false });
  window.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    win.classList.remove('dragging');
    document.body.style.cursor = '';
    app.saveLayout();
  });
  window.addEventListener('pointercancel', () => {
    dragging = false;
    win.classList.remove('dragging');
    document.body.style.cursor = '';
  });
}

export function wireWorkspacePan(app) {
  const workspace = app.$('workspace');
  let panning = false;
  let startX = 0;
  let startY = 0;
  let baseX = 0;
  let baseY = 0;
  workspace.addEventListener('mousedown', (event) => {
    if (!(event.button === 1 || (app.layout().panMode && event.button === 0))) return;
    event.preventDefault();
    event.stopPropagation();
    panning = true;
    startX = event.clientX;
    startY = event.clientY;
    baseX = app.layout().panX;
    baseY = app.layout().panY;
    workspace.classList.add('panning');
    document.body.style.cursor = 'grabbing';
  }, true);
  workspace.addEventListener('auxclick', (event) => {
    if (event.button === 1) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
  window.addEventListener('mousemove', (event) => {
    if (!panning) return;
    event.preventDefault();
    app.patchLayout({ panX: baseX + event.clientX - startX, panY: baseY + event.clientY - startY });
    app.applyCanvasTransform();
  }, { passive: false });
  window.addEventListener('mouseup', () => {
    if (!panning) return;
    panning = false;
    workspace.classList.remove('panning');
    document.body.style.cursor = '';
    app.saveLayout();
  });
  document.addEventListener('mousedown', (event) => {
    if (event.button === 1) event.preventDefault();
  }, true);
}

export function wireInputs(app) {
  bind(app, 'selected-quest-name', (value) => { app.quest().name = value || 'New Quest'; });
  bind(app, 'selected-quest-type', (value) => { app.quest().type = value || 'main'; });
  bind(app, 'selected-calling', (value) => { app.quest().callingText = value; });
  bind(app, 'selected-chronicle', (value) => { app.quest().chronicleId = value || app.doc.defaultChronicleId; });
  bind(app, 'selected-completion', (value) => { app.quest().completionFlag = value; });
  bind(app, 'selected-scenes', (value) => { app.quest().sceneIds = parseList(value); });
  bind(app, 'selected-objects', (value) => { app.quest().objectIds = parseList(value); });
  bind(app, 'selected-block-name', (value) => { app.block().name = value || app.meta(app.block().type).name; });
  bind(app, 'selected-block-type', (value) => {
    const block = app.block();
    block.type = value;
    if (!block.thumbnail) block.thumbnail = app.meta(value).emoji;
  });
  bind(app, 'selected-block-primary', (value) => setPrimaryField(app.block(), app.meta(app.block().type).primaryField, value));
  bind(app, 'selected-block-action', (value) => { app.block().action = value; });
  bind(app, 'selected-block-condition', (value) => { app.block().condition = value; });
  bind(app, 'selected-block-overlay', (value) => { app.block().uiOverlay = value; });
  bind(app, 'selected-block-notes', (value) => { app.block().notes = value; });
  bind(app, 'file-id-input', (value) => { app.doc.id = value; });
  bind(app, 'file-name-input', (value) => { app.doc.name = value || 'Untitled Quest File'; });
  bind(app, 'chronicle-id-input', (value) => { app.doc.defaultChronicleId = value || 'chronicle_01'; });
  bind(app, 'quest-name-input', (value) => { app.quest().name = value || 'New Quest'; });
  bind(app, 'quest-type-input', (value) => { app.quest().type = value || 'main'; });
  bind(app, 'calling-text-input', (value) => { app.quest().callingText = value; });
  bind(app, 'quest-scenes-input', (value) => { app.quest().sceneIds = parseList(value); });
  bind(app, 'quest-objects-input', (value) => { app.quest().objectIds = parseList(value); });
  bind(app, 'completion-flag-input', (value) => { app.quest().completionFlag = value; });
  bind(app, 'quest-rewards-input', (value) => { app.quest().rewards = parseList(value); });
  bind(app, 'quest-codice-input', (value) => { app.quest().codiceUpdates = parseList(value); });
  bind(app, 'quest-notes-input', (value) => { app.quest().notes = value; });
  bind(app, 'block-name-input', (value) => { app.block().name = value || app.meta(app.block().type).name; });
  bind(app, 'block-type-input', (value) => {
    const block = app.block();
    block.type = value;
    if (!block.name || Object.values(BLOCK_TYPES).some((item) => item.name === block.name)) block.name = app.meta(value).name;
    if (!block.thumbnail) block.thumbnail = app.meta(value).emoji;
  });
  bind(app, 'block-scene-input', (value) => { app.block().sceneId = value; });
  bind(app, 'block-object-input', (value) => { app.block().objectId = value; });
  bind(app, 'block-dialogue-input', (value) => { app.block().dialogueId = value; });
  bind(app, 'block-audio-input', (value) => { app.block().audioId = value; });
  bind(app, 'block-condition-input', (value) => { app.block().condition = value; });
  bind(app, 'block-action-input', (value) => { app.block().action = value; });
  bind(app, 'block-overlay-input', (value) => { app.block().uiOverlay = value; });
  bind(app, 'block-capra-input', (value) => { app.block().capraFeedback = value; });
  bind(app, 'block-notes-input', (value) => { app.block().notes = value; });
}

function setPrimaryField(block, field, value) {
  if (!block) return;
  block[field || 'action'] = value;
}

function bind(app, id, fn) {
  app.$(id)?.addEventListener('input', (event) => {
    if (app.quest() || id.startsWith('file')) {
      fn(event.target.value);
      app.render();
    }
  });
}

export function wireActions(app) {
  const addQuestFromMenu = () => { app.addQuest(); closeMenus(); app.toast('Quest added.'); };
  const addBlockFromMenu = () => { app.addBlock(); app.toast('Block added.'); };
  app.$('new-quest-wizard-button').onclick = () => { closeMenus(); app.$('wizard-dialog').showModal(); };
  app.$('new-quest-button').onclick = addQuestFromMenu;
  app.$('create-wizard-quest-button').onclick = () => createWizardQuest(app);
  app.$('save-local-button').onclick = () => { localStorage.setItem(app.storageKey, JSON.stringify(app.doc)); closeMenus(); app.toast('Saved locally.'); };
  app.$('add-quest-button').onclick = app.$('side-add-quest-button').onclick = addQuestFromMenu;
  app.$('status-wizard-button').onclick = () => app.$('wizard-dialog').showModal();
  app.$('status-add-quest-button').onclick = addQuestFromMenu;
  app.$('status-add-block-button').onclick = addBlockFromMenu;
  app.$('status-save-button').onclick = () => { localStorage.setItem(app.storageKey, JSON.stringify(app.doc)); app.toast('Saved locally.'); };
  app.$('edit-quest-button').onclick = () => { closeMenus(); openEditor(app, 'quest'); };
  app.$('delete-quest-button').onclick = () => { app.removeQuest(); closeMenus(); app.toast('Quest deleted.'); };
  app.$('side-add-block-button').onclick = app.$('add-flow-block-button').onclick = () => { app.addBlock(); openEditor(app, 'block'); };
  app.$('edit-block-button').onclick = () => { closeMenus(); openEditor(app, 'block'); };
  app.$('delete-block-button').onclick = () => { app.removeBlock(); closeMenus(); app.toast('Block deleted.'); };
  app.$('save-editor-button').onclick = () => app.toast('Saved.');
  app.$('quest-thumb-button').onclick = () => {
    const quest = app.quest();
    const index = (THUMBNAILS.indexOf(quest.thumbnail || '🏆') + 1) % THUMBNAILS.length;
    quest.thumbnail = THUMBNAILS[index];
    app.render();
  };
  app.$('block-thumb-button').onclick = () => {
    const block = app.block();
    const index = (THUMBNAILS.indexOf(block.thumbnail || app.meta(block.type).emoji) + 1) % THUMBNAILS.length;
    block.thumbnail = THUMBNAILS[index];
    app.render();
  };
  app.$('lock-selected-button').onclick = () => {
    app.state.selectedLocked = !app.state.selectedLocked;
    app.$('selected-card').classList.toggle('locked', app.state.selectedLocked);
    app.$('lock-selected-button').textContent = app.state.selectedLocked ? '🔒' : '🔓';
  };
  app.$('collapse-selected-button').onclick = () => {
    app.$('selected-card').classList.toggle('collapsed');
    app.$('collapse-selected-button').textContent = app.$('selected-card').classList.contains('collapsed') ? '▸' : '▾';
  };
  document.querySelectorAll('[data-add-block]').forEach((button) => {
    button.onclick = () => { app.addBlock(button.dataset.addBlock); closeMenus(); openEditor(app, 'block'); };
  });
  app.$('template-main-quest-button').onclick = () => { app.addQuest({ name: 'New Main Quest', thumbnail: '📜', callingText: 'Define the main Calling for this Quest.', blocks: [{ name: 'Start Scene', type: 'scene', thumbnail: '🖼️' }, { name: 'Key Interaction', type: 'object', thumbnail: '🧩', action: 'interact:key_object' }, { name: 'Calling Fulfilled', type: 'completion', thumbnail: '✅', uiOverlay: 'calling_fulfilled', condition: 'flag_true:quest_complete' }] }); closeMenus(); };
  app.$('template-side-quest-button').onclick = () => { app.addQuest({ name: 'New Side Quest', thumbnail: '🗝️', type: 'side', callingText: 'Define the optional objective or Errand.', blocks: [{ name: 'Optional Trigger', type: 'condition', thumbnail: '🔀', condition: 'flag_true:sidequest_available' }, { name: 'Reward', type: 'reward', thumbnail: '🎁', action: 'grant_reward:silver' }] }); closeMenus(); };
  app.$('export-json-button').onclick = () => { downloadJson(slugify(app.doc.name) + '.json', exportQuestFile(app.doc)); closeMenus(); app.toast('JSON exported.'); };
  app.$('view-json-button').onclick = () => { app.$('json-preview').textContent = exportQuestFile(app.doc); closeMenus(); app.$('json-dialog').showModal(); };
  app.$('block-types-button').onclick = () => {
    const rows = Object.entries(BLOCK_TYPES).map(([key, item]) => `<article class="block-type-card"><strong>${item.emoji} ${item.name}</strong><span>${key} / ${item.category} / primary: ${item.primaryField}</span><span>required: ${(item.requiredFields || []).join(', ') || 'none'}</span><span>${item.hint}</span></article>`).join('');
    app.help('Quest Block Type List', `<div class="block-type-grid">${rows}</div>`);
    closeMenus();
  };
  app.$('library-note-button').onclick = () => { app.help('Linked Libraries', '<p>Quest Builder references completed scenes, archetype objects, dialogue IDs, audio IDs, Capra popup templates, Codice entries, UI overlays, rewards, route unlocks, and completion flags. It should not own those libraries directly.</p>'); closeMenus(); };
  app.$('quick-start-button').onclick = () => { app.help('Quick Start', '<p>Click the quest header, Calling pill, or any flow card in the viewing area to inspect it on the left. Use the green status strip buttons for wizard, add quest, add block, and local save.</p>'); closeMenus(); };
  app.$('about-button').onclick = () => { app.help('About Quest Builder', '<p>Quest Builder assembles scenes, actions, linked dialogue/audio, objects, Capra feedback, Codice updates, UI overlays, rewards, map unlocks, and completion flags into playable Quest flow.</p>'); closeMenus(); };
  app.$('bg-dark-button').onclick = () => { app.state.mode = 'dark'; closeMenus(); app.draw(); };
  app.$('bg-light-button').onclick = () => { app.state.mode = 'light'; closeMenus(); app.draw(); };
  app.$('zoom-in-button').onclick = () => { app.patchLayout({ zoom: Math.min(1.6, app.layout().zoom + .1) }); app.saveLayout(); app.render(); };
  app.$('zoom-out-button').onclick = () => { app.patchLayout({ zoom: Math.max(.7, app.layout().zoom - .1) }); app.saveLayout(); app.render(); };
  app.$('zoom-reset-button').onclick = () => { app.patchLayout({ zoom: 1, panX: 0, panY: 0 }); app.saveLayout(); app.render(); };
  app.$('pan-toggle-button').onclick = () => { app.patchLayout({ panMode: !app.layout().panMode }); app.saveLayout(); app.applyLayout(); };
  app.$('collapse-flow-button').onclick = () => { const next = !app.layout().flowCollapsed; app.patchLayout({ flowCollapsed: next, flowW: next ? app.layout().flowW : Math.max(app.layout().flowW, 220), flowH: next ? app.layout().flowH : Math.max(app.layout().flowH, 90) }); app.saveLayout(); app.applyLayout(); };
  app.$('toggle-flow-layout-button').onclick = () => { const vertical = !app.layout().flowVertical; app.patchLayout({ flowVertical: vertical, flowW: vertical ? Math.min(app.layout().flowW, 390) : Math.max(app.layout().flowW, 720), flowH: vertical ? Math.max(app.layout().flowH, 420) : 116 }); app.saveLayout(); app.applyLayout(); };
  app.$('reset-layout-button').onclick = () => { app.resetLayout(); closeMenus(); app.toast('Layout reset.'); };
  app.$('import-json-input').onchange = async (event) => { const file = event.target.files[0]; if (!file) return; Object.assign(app.doc, JSON.parse(await file.text())); app.state.activeQuest = 0; app.state.activeBlock = 0; app.state.inspectorTarget = 'quest'; closeMenus(); app.render(); app.toast('JSON imported.'); };
  app.$('snapshot-button').onclick = () => { const link = document.createElement('a'); link.href = app.canvas.toDataURL('image/png'); link.download = 'quest-builder-snapshot.png'; link.click(); closeMenus(); };
}
