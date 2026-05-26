import {
  editorState,
  onStateChange,
  resetArchetype,
  applyRoleTemplate,
  loadArchetype,
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
import {
  CATEGORIES,
  GAMEPLAY_ACTIONS,
  OBJECT_TEMPLATE_IDS,
  PEOPLE_TEMPLATE_IDS,
  PORTRAIT_ACTIONS,
  ROLE_TEMPLATES,
  RUNTIME_FLAGS
} from './templates.js';
import {
  captureCanvasSnapshot,
  deleteLocalArchetype,
  downloadCurrentArchetype,
  importArchetypeFromFile,
  listLocalArchetypes,
  loadLocalArchetype,
  saveCurrentLocal
} from './editor-io.js';
import { getCanvas } from './editor-renderer.js';

let isRendering = false;
const elements = {};

const TEMPLATE_ICONS = {
  person_static: '♙', person_npc_basic: '♙', person_npc_moving: '♙', person_vendor_job: '◈', person_companion: '✦',
  person_player_full: '☥', person_foe_human: '⚔', person_thrall: '◉', person_caster: '✧', creature_foe: '♞', boss_bellator: '♛',
  static_prop: '▣', door_exit: '⌂', pickup: '✦', searchable_cache: '▤', throwable_object: '⬣', marker: '⬡', hazard: '⚠'
};

const CATEGORY_COLOURS = {
  character: '#d84545', npc: '#d9a441', enemy: '#b83246', creature: '#7c9c4b', boss: '#8a2d95', prop: '#8a7465',
  door_exit: '#9b6a3a', pickup: '#e2cca7', marker: '#bfc56a', interactable: '#57bd8c', searchable_cache: '#8f735b', hazard: '#d84545'
};

const quickstartFlow = {
  source: '',
  selectedRole: '',
  existingData: null
};

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
  setupLibraryControls();
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
    'person-template-list', 'object-template-list', 'local-dialog', 'local-files-output', 'help-dialog', 'help-title', 'help-content',
    'object-library-dialog', 'object-library-content', 'quickstart-dialog', 'quickstart-title', 'quickstart-step-label', 'quickstart-content'
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
  document.getElementById('quickstart-wizard-button')?.addEventListener('click', () => {
    openQuickstartWizard();
    closeMenus();
  });
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

function setupLibraryControls() {
  document.getElementById('open-object-library-button')?.addEventListener('click', () => {
    openObjectLibrary('all');
    closeMenus();
  });
  document.getElementById('open-template-library-button')?.addEventListener('click', () => {
    openObjectLibrary('templates');
    closeMenus();
  });
  document.getElementById('clone-existing-button')?.addEventListener('click', () => {
    openQuickstartWizard('existing');
    closeMenus();
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
        <li>Use File → Quick Start Wizard for the guided flow.</li>
        <li>Choose Template to start from a standard object type, or Existing Object to copy a saved library item.</li>
        <li>Pick what the object should be able to do: runtime flags, gameplay sprite actions, and portrait actions.</li>
        <li>Set the ID, name, subtype, tags, sprite asset ID, optional portrait asset ID, then save or export JSON.</li>
        <li>Do not add Talk as a gameplay action; dialogue mouth movement belongs to portrait actions.</li>
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

function openObjectLibrary(mode = 'all') {
  renderObjectLibrary(mode);
  elements['object-library-dialog'].showModal();
}

function renderObjectLibrary(mode = 'all') {
  const content = elements['object-library-content'];
  content.innerHTML = '';

  if (mode === 'all' || mode === 'templates') {
    content.appendChild(createLibrarySection('Template Library', getAllTemplateIds().map((roleId) => ({ type: 'template', roleId }))));
  }

  if (mode === 'all' || mode === 'existing') {
    const saved = listLocalArchetypes().map((item) => ({ type: 'local', item }));
    content.appendChild(createLibrarySection('Saved Local Archetypes', saved));
  }
}

function createLibrarySection(title, rows) {
  const section = document.createElement('section');
  section.className = 'library-section';
  const heading = document.createElement('h3');
  heading.textContent = title;
  section.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'template-card-grid';

  if (!rows.length) {
    const empty = document.createElement('p');
    empty.className = 'hint';
    empty.textContent = title.includes('Saved') ? 'No local object archetypes saved yet.' : 'No templates found.';
    section.appendChild(empty);
    return section;
  }

  for (const row of rows) {
    grid.appendChild(row.type === 'template' ? createTemplateCard(row.roleId, 'library') : createLocalLibraryCard(row.item));
  }

  section.appendChild(grid);
  return section;
}

function createTemplateCard(roleId, context = 'library') {
  const template = ROLE_TEMPLATES[roleId];
  const card = document.createElement('article');
  card.className = 'template-card';
  card.innerHTML = `
    <img class="template-card-image" src="${getTemplateSvgDataUri(roleId)}" alt="" />
    <div class="template-card-body">
      <h4>${escapeHtml(template.label)}</h4>
      <p>${escapeHtml(template.category)} · ${template.gameplayActions.length} gameplay actions</p>
    </div>
  `;
  const use = document.createElement('button');
  use.type = 'button';
  use.textContent = context === 'wizard' ? 'Choose Template' : 'Use Template';
  use.addEventListener('click', () => {
    applyRoleTemplate(roleId);
    quickstartFlow.selectedRole = roleId;
    if (context === 'wizard') renderQuickstartAbilities();
    else {
      elements['object-library-dialog'].close();
      showToast(`${template.label} template applied.`, 'success');
    }
  });
  card.appendChild(use);
  return card;
}

function createLocalLibraryCard(item) {
  const data = item.data || {};
  const card = document.createElement('article');
  card.className = 'template-card';
  const roleId = ROLE_TEMPLATES[data.role] ? data.role : 'static_prop';
  card.innerHTML = `
    <img class="template-card-image" src="${getTemplateSvgDataUri(roleId)}" alt="" />
    <div class="template-card-body">
      <h4>${escapeHtml(data.name || data.id || 'Unnamed Object')}</h4>
      <p>${escapeHtml(data.category || 'unknown')} · ${escapeHtml(data.role || 'no role')}</p>
    </div>
  `;
  const load = document.createElement('button');
  load.type = 'button';
  load.textContent = 'Load';
  load.addEventListener('click', () => {
    loadLocalArchetype(item.key);
    elements['object-library-dialog'].close();
    showToast('Local object archetype loaded.', 'success');
  });
  const clone = document.createElement('button');
  clone.type = 'button';
  clone.textContent = 'Copy as New';
  clone.addEventListener('click', () => {
    loadArchetype(cloneAsNewArchetype(data));
    elements['object-library-dialog'].close();
    showToast('Copied existing object as a new archetype.', 'success');
  });
  const actions = document.createElement('div');
  actions.className = 'template-card-actions';
  actions.append(load, clone);
  card.appendChild(actions);
  return card;
}

function openQuickstartWizard(forcedSource = '') {
  quickstartFlow.source = '';
  quickstartFlow.selectedRole = editorState.archetype.role || 'person_npc_basic';
  quickstartFlow.existingData = null;
  elements['quickstart-dialog'].showModal();
  if (forcedSource === 'existing') renderQuickstartExisting();
  else if (forcedSource === 'template') renderQuickstartTemplateChoice();
  else renderQuickstartStart();
}

function renderQuickstartStart() {
  setWizardHeader('Quick Start Wizard', 'Step 1: choose a starting point');
  const content = elements['quickstart-content'];
  content.innerHTML = `
    <div class="wizard-choice-grid">
      <button type="button" class="wizard-choice" data-source="template">
        <strong>Template</strong>
        <span>Start from a standard object type with default actions, flags, size, collision, and a placeholder SVG.</span>
      </button>
      <button type="button" class="wizard-choice" data-source="existing">
        <strong>Existing Object</strong>
        <span>Copy an object already saved in the Archetype Object Library, then make a new version from it.</span>
      </button>
    </div>
  `;
  content.querySelector('[data-source="template"]')?.addEventListener('click', renderQuickstartTemplateChoice);
  content.querySelector('[data-source="existing"]')?.addEventListener('click', renderQuickstartExisting);
}

function renderQuickstartTemplateChoice() {
  quickstartFlow.source = 'template';
  setWizardHeader('Quick Start Wizard', 'Step 2: what type of object is this?');
  const content = elements['quickstart-content'];
  content.innerHTML = `
    <p class="hint">Choose the closest starter. You can adjust actions, flags, IDs, and asset links on the next screens.</p>
    <div class="wizard-toolbar"><button type="button" data-back>Back</button></div>
    <div class="template-card-grid wizard-template-grid"></div>
  `;
  content.querySelector('[data-back]')?.addEventListener('click', renderQuickstartStart);
  const grid = content.querySelector('.wizard-template-grid');
  for (const roleId of getAllTemplateIds()) grid.appendChild(createTemplateCard(roleId, 'wizard'));
}

function renderQuickstartExisting() {
  quickstartFlow.source = 'existing';
  setWizardHeader('Quick Start Wizard', 'Step 2: choose an existing object to copy');
  const content = elements['quickstart-content'];
  const saved = listLocalArchetypes();
  content.innerHTML = `
    <p class="hint">This does not overwrite the original. It loads a copied version with a new ID so it can become a new archetype.</p>
    <div class="wizard-toolbar"><button type="button" data-back>Back</button></div>
    <div class="template-card-grid wizard-existing-grid"></div>
  `;
  content.querySelector('[data-back]')?.addEventListener('click', renderQuickstartStart);
  const grid = content.querySelector('.wizard-existing-grid');
  if (!saved.length) {
    grid.innerHTML = '<p class="hint">No existing local objects found yet. Save an archetype locally first, or go back and start from a template.</p>';
    return;
  }
  for (const item of saved) {
    const card = createLocalWizardCard(item);
    grid.appendChild(card);
  }
}

function createLocalWizardCard(item) {
  const data = item.data || {};
  const roleId = ROLE_TEMPLATES[data.role] ? data.role : 'static_prop';
  const card = document.createElement('article');
  card.className = 'template-card';
  card.innerHTML = `
    <img class="template-card-image" src="${getTemplateSvgDataUri(roleId)}" alt="" />
    <div class="template-card-body">
      <h4>${escapeHtml(data.name || data.id || 'Unnamed Object')}</h4>
      <p>${escapeHtml(data.category || 'unknown')} · ${escapeHtml(data.role || 'no role')}</p>
    </div>
  `;
  const choose = document.createElement('button');
  choose.type = 'button';
  choose.textContent = 'Copy This Object';
  choose.addEventListener('click', () => {
    const clone = cloneAsNewArchetype(data);
    quickstartFlow.existingData = clone;
    loadArchetype(clone);
    renderQuickstartAbilities();
  });
  card.appendChild(choose);
  return card;
}

function renderQuickstartAbilities() {
  setWizardHeader('Quick Start Wizard', 'Step 3: what should it be able to do?');
  const content = elements['quickstart-content'];
  const item = editorState.archetype;
  content.innerHTML = `
    <p class="hint">These choices control runtime behaviour and animation expectations. Talk is intentionally not a body sprite action.</p>
    <div class="wizard-toolbar">
      <button type="button" data-back>Back</button>
      <button type="button" data-next>Next: basic changes</button>
    </div>
    <div class="wizard-columns">
      <section><h3>Runtime Flags</h3><div class="wizard-checks" data-wizard-flags></div></section>
      <section><h3>Gameplay Sprite Actions</h3><div class="wizard-checks" data-wizard-gameplay></div></section>
      <section><h3>Dialogue Portrait Actions</h3><div class="wizard-checks" data-wizard-portrait></div></section>
    </div>
  `;
  content.querySelector('[data-back]')?.addEventListener('click', () => {
    if (quickstartFlow.source === 'existing') renderQuickstartExisting();
    else renderQuickstartTemplateChoice();
  });
  content.querySelector('[data-next]')?.addEventListener('click', renderQuickstartBasics);
  renderWizardFlagChecks(content.querySelector('[data-wizard-flags]'), item);
  renderWizardActionChecks(content.querySelector('[data-wizard-gameplay]'), GAMEPLAY_ACTIONS, item.animationProfile.gameplayActions, 'gameplay');
  renderWizardActionChecks(content.querySelector('[data-wizard-portrait]'), PORTRAIT_ACTIONS, item.animationProfile.portraitActions, 'portrait');
}

function renderWizardFlagChecks(container, item) {
  container.innerHTML = '';
  for (const flag of RUNTIME_FLAGS) {
    const row = document.createElement('label');
    row.className = 'wizard-check-row';
    row.innerHTML = `<span>${flag.label}</span><input type="checkbox" ${item.behaviour.flags[flag.key] ? 'checked' : ''} />`;
    row.querySelector('input').addEventListener('change', (event) => updateFlag(flag.key, event.target.checked));
    container.appendChild(row);
  }
}

function renderWizardActionChecks(container, actions, selected, type) {
  container.innerHTML = '';
  const selectedSet = new Set(selected);
  for (const action of actions) {
    const row = document.createElement('label');
    row.className = 'wizard-check-row';
    row.innerHTML = `<span>${action.label}</span><input type="checkbox" ${selectedSet.has(action.id) ? 'checked' : ''} />`;
    row.querySelector('input').addEventListener('change', () => {
      if (type === 'gameplay') toggleGameplayAction(action.id);
      else togglePortraitAction(action.id);
    });
    container.appendChild(row);
  }
}

function renderQuickstartBasics() {
  setWizardHeader('Quick Start Wizard', 'Step 4: make the basic changes');
  const item = editorState.archetype;
  const content = elements['quickstart-content'];
  content.innerHTML = `
    <p class="hint">This is the fast edit screen for making the copied/template object become its own new archetype.</p>
    <div class="wizard-toolbar">
      <button type="button" data-back>Back</button>
      <button type="button" data-save>Finish + Save Local</button>
      <button type="button" data-finish>Finish</button>
    </div>
    <div class="wizard-form-grid">
      <label>Archetype ID<input data-field="id" value="${escapeHtml(item.id)}" /></label>
      <label>Name<input data-field="name" value="${escapeHtml(item.name)}" /></label>
      <label>Subtype<input data-field="subtype" value="${escapeHtml(item.subtype)}" /></label>
      <label>Tags<input data-field="tags" value="${escapeHtml(item.tags.join(', '))}" /></label>
      <label>Gameplay Sprite Asset ID<input data-field="spriteAssetId" value="${escapeHtml(item.visual.spriteAssetId)}" /></label>
      <label>Dialogue Portrait Asset ID<input data-field="portraitAssetId" value="${escapeHtml(item.visual.portraitAssetId)}" /></label>
    </div>
  `;
  content.querySelector('[data-back]')?.addEventListener('click', renderQuickstartAbilities);
  content.querySelector('[data-finish]')?.addEventListener('click', () => finishQuickstart(false));
  content.querySelector('[data-save]')?.addEventListener('click', () => finishQuickstart(true));
  content.querySelectorAll('[data-field]').forEach((input) => {
    input.addEventListener('input', () => updateFromWizardBasicField(input.dataset.field, input.value));
  });
}

function updateFromWizardBasicField(field, value) {
  if (field === 'id') updateIdentity({ id: value });
  if (field === 'name') updateIdentity({ name: value });
  if (field === 'subtype') updateIdentity({ subtype: value });
  if (field === 'tags') updateIdentity({ tags: value });
  if (field === 'spriteAssetId') updateArchetype({ visual: { spriteAssetId: value } });
  if (field === 'portraitAssetId') updateArchetype({ visual: { portraitAssetId: value } });
}

function finishQuickstart(shouldSave) {
  validateCurrentArchetype();
  if (shouldSave) saveCurrentLocal();
  elements['quickstart-dialog'].close();
  renderUI(editorState);
  showToast(shouldSave ? 'Quick Start complete and saved locally.' : 'Quick Start complete.', 'success');
}

function setWizardHeader(title, step) {
  elements['quickstart-title'].textContent = title;
  elements['quickstart-step-label'].textContent = step;
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
    const clone = document.createElement('button');
    clone.textContent = 'Copy as New';
    clone.addEventListener('click', () => {
      loadArchetype(cloneAsNewArchetype(item.data));
      elements['local-dialog'].close();
      showToast('Copied existing object as a new archetype.', 'success');
    });
    const remove = document.createElement('button');
    remove.textContent = 'Delete';
    remove.addEventListener('click', () => {
      deleteLocalArchetype(item.key);
      renderLocalDialog();
      showToast('Local object archetype deleted.', 'warn');
    });
    card.append(load, clone, remove);
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


function getAllTemplateIds() {
  return [...PEOPLE_TEMPLATE_IDS, ...OBJECT_TEMPLATE_IDS];
}

function getTemplateSvgDataUri(roleId) {
  const template = ROLE_TEMPLATES[roleId] || ROLE_TEMPLATES.person_npc_basic;
  const colour = CATEGORY_COLOURS[template.category] || '#d84545';
  const icon = TEMPLATE_ICONS[roleId] || '⬡';
  const title = escapeHtml(template.label || roleId);
  const subtitle = escapeHtml(template.category || 'object');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 120" role="img" aria-label="${title}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a201a"/><stop offset="1" stop-color="#0f0c0b"/></linearGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="2.4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect x="3" y="3" width="174" height="114" rx="18" fill="url(#bg)" stroke="#382a21" stroke-width="3"/>
    <circle cx="90" cy="45" r="26" fill="${colour}" opacity="0.2" filter="url(#glow)"/>
    <text x="90" y="55" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-weight="700" fill="#fff0ce">${icon}</text>
    <text x="90" y="86" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#fff0ce">${title}</text>
    <text x="90" y="101" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="#8a7465">${subtitle}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function cloneAsNewArchetype(data) {
  const clone = JSON.parse(JSON.stringify(data || {}));
  const baseId = safeId(clone.id || clone.name || 'object_archetype');
  const suffix = Date.now().toString(36).slice(-5);
  clone.id = `${baseId}_variant_${suffix}`;
  clone.name = `${clone.name || clone.id || 'Object Archetype'} Variant`;
  clone.createdAt = new Date().toISOString();
  clone.updatedAt = new Date().toISOString();
  return clone;
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

function safeId(value) {
  return String(value || 'object_archetype').trim().toLowerCase().replace(/[^a-z0-9_\-]+/g, '_').replace(/^_+|_+$/g, '') || 'object_archetype';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}
