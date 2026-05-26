import {
  editorState,
  onStateChange,
  resetArchetype,
  applyRoleTemplate,
  updateIdentity,
  updateArchetype,
  updateFlag,
  toggleGameplayAction,
  togglePortraitAction,
  selectGameplayAction,
  duplicateSelectedGameplayAction,
  deleteSelectedGameplayAction,
  resetBounds,
  setWorkspaceMode,
  toggleGrid,
  toggleHelpers,
  setZoom,
  validateCurrentArchetype
} from './editor-state.js';
import { CATEGORIES, GAMEPLAY_ACTIONS, OBJECT_TEMPLATE_IDS, PEOPLE_TEMPLATE_IDS, PORTRAIT_ACTIONS, ROLE_TEMPLATES, RUNTIME_FLAGS } from './templates.js';
import { captureCanvasSnapshot, deleteLocalArchetype, downloadCurrentArchetype, importArchetypeFromFile, listLocalArchetypes, loadLocalArchetype, saveCurrentLocal } from './editor-io.js';
import { getCanvas } from './editor-renderer.js';

let isRendering = false;
const elements = {};

export function initUI() {
  cacheElements();
  setupMenus();
  setupIdentityControls();
  setupVisualControls();
  setupCollisionControls();
  setupFlagControls();
  setupActionLists();
  setupTemplateMenus();
  setupFileControls();
  setupViewControls();
  setupResizeHandles();
  setupHelp();
  onStateChange(renderUI);
  renderUI(editorState);
}

export function showToast(message, type = 'success') {
  const area = document.getElementById('toast-area');
  if (!area) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  area.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function cacheElements() {
  const ids = [
    'archetype-id-input', 'archetype-name-input', 'category-select', 'role-select', 'subtype-input', 'tags-input',
    'sprite-asset-input', 'portrait-asset-input', 'width-input', 'height-input', 'layer-input', 'anchor-select',
    'collision-type-select', 'hitbox-x-input', 'hitbox-y-input', 'hitbox-width-input', 'hitbox-height-input', 'interaction-radius-input',
    'flag-list', 'gameplay-action-list', 'portrait-action-list', 'action-count', 'validation-output', 'status-text', 'zoom-readout',
    'person-template-list', 'object-template-list', 'local-dialog', 'local-files-output', 'help-dialog', 'help-title', 'help-content'
  ];
  for (const id of ids) elements[id] = document.getElementById(id);
}

function setupMenus() {
  document.querySelectorAll('.menu-button').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const target = document.getElementById(`menu-${button.dataset.menu}`);
      const isOpen = target?.classList.contains('open');
      closeMenus();
      if (target && !isOpen) target.classList.add('open');
    });
  });
  document.addEventListener('click', closeMenus);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenus();
  });
}

function closeMenus() {
  document.querySelectorAll('.menu-panel.open').forEach((panel) => panel.classList.remove('open'));
}

function setupIdentityControls() {
  fillSelect(elements['category-select'], CATEGORIES.map((item) => [item.value, item.label]));
  fillSelect(elements['role-select'], Object.entries(ROLE_TEMPLATES).map(([key, template]) => [key, template.label]));
  bindInput('archetype-id-input', (value) => updateIdentity({ id: value }));
  bindInput('archetype-name-input', (value) => updateIdentity({ name: value }));
  bindInput('category-select', (value) => updateIdentity({ category: value }));
  bindInput('role-select', (value) => applyRoleTemplate(value));
  bindInput('subtype-input', (value) => updateIdentity({ subtype: value }));
  bindInput('tags-input', (value) => updateIdentity({ tags: value }));
}

function setupVisualControls() {
  bindInput('sprite-asset-input', (value) => updateArchetype({ visual: { spriteAssetId: value } }));
  bindInput('portrait-asset-input', (value) => updateArchetype({ visual: { portraitAssetId: value } }));
  bindInput('width-input', (value) => updateArchetype({ visual: { width: Number(value) } }));
  bindInput('height-input', (value) => updateArchetype({ visual: { height: Number(value) } }));
  bindInput('layer-input', (value) => updateArchetype({ visual: { defaultSceneLayer: Number(value) } }));
  bindInput('anchor-select', (value) => updateArchetype({ visual: { anchor: value } }));
}

function setupCollisionControls() {
  bindInput('collision-type-select', (value) => updateArchetype({ collision: { type: value } }));
  bindInput('hitbox-x-input', (value) => updateArchetype({ collision: { hitbox: { x: Number(value) } } }));
  bindInput('hitbox-y-input', (value) => updateArchetype({ collision: { hitbox: { y: Number(value) } } }));
  bindInput('hitbox-width-input', (value) => updateArchetype({ collision: { hitbox: { width: Number(value) } } }));
  bindInput('hitbox-height-input', (value) => updateArchetype({ collision: { hitbox: { height: Number(value) } } }));
  bindInput('interaction-radius-input', (value) => updateArchetype({ collision: { interactionRadius: Number(value) } }));
}

function setupFlagControls() {
  elements['flag-list'].innerHTML = '';
  for (const flag of RUNTIME_FLAGS) {
    const row = document.createElement('label');
    row.className = 'check-row';
    row.innerHTML = `<span>${flag.label}</span><input type="checkbox" data-flag="${flag.key}" />`;
    row.querySelector('input').addEventListener('change', (event) => updateFlag(flag.key, event.target.checked));
    elements['flag-list'].appendChild(row);
  }
}

function setupActionLists() {
  elements['gameplay-action-list'].innerHTML = '';
  for (const action of GAMEPLAY_ACTIONS) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'action-chip';
    chip.dataset.action = action.id;
    chip.textContent = action.label;
    chip.title = 'Click to enable/disable. Shift-click to select for duplicate/remove.';
    chip.addEventListener('click', (event) => {
      if (event.shiftKey) selectGameplayAction(action.id);
      else toggleGameplayAction(action.id);
    });
    elements['gameplay-action-list'].appendChild(chip);
  }

  elements['portrait-action-list'].innerHTML = '';
  for (const action of PORTRAIT_ACTIONS) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'action-chip';
    chip.dataset.portraitAction = action.id;
    chip.textContent = action.label;
    chip.addEventListener('click', () => togglePortraitAction(action.id));
    elements['portrait-action-list'].appendChild(chip);
  }

  document.getElementById('duplicate-action-button')?.addEventListener('click', () => {
    if (duplicateSelectedGameplayAction()) showToast('Selected action duplicated as a variant.', 'success');
    else showToast('Shift-click a gameplay action first.', 'warn');
  });
  document.getElementById('delete-action-button')?.addEventListener('click', () => {
    if (deleteSelectedGameplayAction()) showToast('Selected action removed.', 'success');
    else showToast('Shift-click a gameplay action first.', 'warn');
  });
  document.getElementById('reset-bounds-button')?.addEventListener('click', () => {
    resetBounds();
    showToast('Bounds reset from current role template.', 'success');
  });
  document.getElementById('validate-button')?.addEventListener('click', () => {
    validateCurrentArchetype();
    renderUI(editorState);
    showToast('Validation refreshed.', 'success');
  });
}

function setupTemplateMenus() {
  renderTemplateButtons(elements['person-template-list'], PEOPLE_TEMPLATE_IDS);
  renderTemplateButtons(elements['object-template-list'], OBJECT_TEMPLATE_IDS);
}

function renderTemplateButtons(container, ids) {
  container.innerHTML = '';
  for (const id of ids) {
    const template = ROLE_TEMPLATES[id];
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = template.label;
    button.addEventListener('click', () => {
      applyRoleTemplate(id);
      closeMenus();
      showToast(`${template.label} template applied.`, 'success');
    });
    container.appendChild(button);
  }
}

function setupFileControls() {
  document.getElementById('new-archetype-button')?.addEventListener('click', () => {
    resetArchetype();
    closeMenus();
    showToast('New object archetype created.', 'success');
  });
  document.getElementById('export-json-button')?.addEventListener('click', () => {
    downloadCurrentArchetype();
    closeMenus();
    showToast('Object archetype JSON exported.', 'success');
  });
  document.getElementById('save-local-button')?.addEventListener('click', () => {
    saveCurrentLocal();
    closeMenus();
    showToast('Saved locally in this browser.', 'success');
  });
  document.getElementById('view-local-button')?.addEventListener('click', () => {
    renderLocalDialog();
    elements['local-dialog'].showModal();
    closeMenus();
  });
  document.getElementById('import-json-input')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await importArchetypeFromFile(file);
      showToast('Object archetype imported.', 'success');
    } catch (error) {
      showToast(`Import failed: ${error.message}`, 'error');
    } finally {
      event.target.value = '';
      closeMenus();
    }
  });
  document.getElementById('snapshot-button')?.addEventListener('click', () => {
    const canvas = getCanvas();
    if (canvas) captureCanvasSnapshot(canvas);
  });
}

function setupViewControls() {
  document.querySelectorAll('[data-workspace-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      setWorkspaceMode(button.dataset.workspaceMode);
      closeMenus();
    });
  });
  document.getElementById('toggle-grid-button')?.addEventListener('click', () => {
    toggleGrid();
    closeMenus();
  });
  document.getElementById('toggle-helpers-button')?.addEventListener('click', () => {
    toggleHelpers();
    closeMenus();
  });
  document.getElementById('zoom-in-button')?.addEventListener('click', () => setZoom(editorState.zoom + 0.1));
  document.getElementById('zoom-out-button')?.addEventListener('click', () => setZoom(editorState.zoom - 0.1));
  document.getElementById('zoom-reset-button')?.addEventListener('click', () => setZoom(1));
}

function setupResizeHandles() {
  const sidePanel = document.getElementById('left-panel');
  const sideResizer = document.getElementById('side-resizer');
  const bottomPanel = document.getElementById('bottom-panel');
  const bottomResizer = document.getElementById('bottom-resizer');

  sideResizer?.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = sidePanel.getBoundingClientRect().width;
    const move = (moveEvent) => {
      sidePanel.style.width = `${Math.min(590, Math.max(260, startWidth + moveEvent.clientX - startX))}px`;
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  });

  bottomResizer?.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const startY = event.clientY;
    const startHeight = bottomPanel.getBoundingClientRect().height;
    const move = (moveEvent) => {
      bottomPanel.style.height = `${Math.min(520, Math.max(120, startHeight - (moveEvent.clientY - startY)))}px`;
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  });
}

function setupHelp() {
  document.getElementById('quick-start-button')?.addEventListener('click', () => {
    openHelp('Quick Start Guide', `
      <ol>
        <li>Choose a person or object template from the Templates menu.</li>
        <li>Set the archetype ID, display name, category, subtype, and tags.</li>
        <li>Link the gameplay sprite asset ID and optional dialogue portrait asset ID.</li>
        <li>Choose gameplay sprite actions. Do not add Talk here; close-up dialogue is a portrait action.</li>
        <li>Check collision, interaction radius, runtime flags, then export JSON.</li>
      </ol>
    `);
  });
  document.getElementById('about-button')?.addEventListener('click', () => {
    openHelp('About V1.0', `
      <p>This is the non-FX Object Archetype Creator. It keeps the Artifex editor shell architecture from the Effect Editor but removes particles, glow engines, emitter dynamics, and effect-layer controls.</p>
      <p>It creates reusable object definitions for characters, NPCs, Foes, props, pickups, doors, markers, caches, hazards, and other scene-placeable game objects.</p>
    `);
  });
}

function openHelp(title, html) {
  elements['help-title'].textContent = title;
  elements['help-content'].innerHTML = html;
  elements['help-dialog'].showModal();
  closeMenus();
}

function renderLocalDialog() {
  const list = listLocalArchetypes();
  const output = elements['local-files-output'];
  output.innerHTML = '';
  if (!list.length) {
    output.innerHTML = '<p class="hint">No local object archetypes saved yet.</p>';
    return;
  }
  for (const item of list) {
    const card = document.createElement('article');
    card.className = 'library-card';
    card.innerHTML = `<h3>${escapeHtml(item.data.name || item.data.id)}</h3><p>${escapeHtml(item.data.category || 'unknown')} / ${escapeHtml(item.data.role || '')}</p>`;
    const load = document.createElement('button');
    load.textContent = 'Load';
    load.addEventListener('click', () => {
      loadLocalArchetype(item.key);
      elements['local-dialog'].close();
      showToast('Local object archetype loaded.', 'success');
    });
    const remove = document.createElement('button');
    remove.textContent = 'Delete';
    remove.addEventListener('click', () => {
      deleteLocalArchetype(item.key);
      renderLocalDialog();
      showToast('Local object archetype deleted.', 'warn');
    });
    card.append(load, remove);
    output.appendChild(card);
  }
}

function renderUI(state) {
  if (isRendering) return;
  isRendering = true;
  const item = state.archetype;
  setValue('archetype-id-input', item.id);
  setValue('archetype-name-input', item.name);
  setValue('category-select', item.category);
  setValue('role-select', item.role);
  setValue('subtype-input', item.subtype);
  setValue('tags-input', item.tags.join(', '));
  setValue('sprite-asset-input', item.visual.spriteAssetId);
  setValue('portrait-asset-input', item.visual.portraitAssetId);
  setValue('width-input', item.visual.width);
  setValue('height-input', item.visual.height);
  setValue('layer-input', item.visual.defaultSceneLayer);
  setValue('anchor-select', item.visual.anchor);
  setValue('collision-type-select', item.collision.type);
  setValue('hitbox-x-input', item.collision.hitbox.x);
  setValue('hitbox-y-input', item.collision.hitbox.y);
  setValue('hitbox-width-input', item.collision.hitbox.width);
  setValue('hitbox-height-input', item.collision.hitbox.height);
  setValue('interaction-radius-input', item.collision.interactionRadius);

  document.querySelectorAll('[data-flag]').forEach((input) => {
    input.checked = Boolean(item.behaviour.flags[input.dataset.flag]);
  });
  document.querySelectorAll('[data-action]').forEach((chip) => {
    chip.classList.toggle('enabled', item.animationProfile.gameplayActions.includes(chip.dataset.action));
    chip.classList.toggle('selected', state.selectedGameplayAction === chip.dataset.action);
  });
  document.querySelectorAll('[data-portrait-action]').forEach((chip) => {
    chip.classList.toggle('enabled', item.animationProfile.portraitActions.includes(chip.dataset.portraitAction));
  });

  elements['action-count'].textContent = `${item.animationProfile.gameplayActions.length} gameplay actions / ${item.animationProfile.portraitActions.length} portrait actions`;
  elements['validation-output'].textContent = formatValidation(state.validation);
  elements['status-text'].textContent = `${item.id} · ${item.category} · ${item.role}`;
  elements['zoom-readout'].textContent = `${Math.round(state.zoom * 100)}%`;
  isRendering = false;
}

function formatValidation(validation) {
  if (!validation.length) return 'Valid. No issues found.';
  return validation.map((item) => `${item.type.toUpperCase()}: ${item.message}`).join('\n');
}

function bindInput(id, callback) {
  const element = elements[id] || document.getElementById(id);
  element?.addEventListener('input', () => {
    if (isRendering) return;
    callback(element.value);
  });
  element?.addEventListener('change', () => {
    if (isRendering) return;
    callback(element.value);
  });
}

function fillSelect(select, rows) {
  if (!select) return;
  select.innerHTML = rows.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join('');
}

function setValue(id, value) {
  const element = elements[id];
  if (!element) return;
  const next = String(value ?? '');
  if (element.value !== next) element.value = next;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}
