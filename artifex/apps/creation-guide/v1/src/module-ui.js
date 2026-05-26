import {
  addAssignment,
  addSubtaskToActive,
  deleteActiveAssignment,
  deleteSubtask,
  duplicateActiveAssignment,
  getActiveAssignment,
  getCompletion,
  getEffectiveEffort,
  getEffectivePriority,
  getVisibleAssignments,
  moduleState,
  onStateChange,
  resetDocument,
  selectAssignment,
  setSubtaskStatus,
  setTodoSort,
  setWorkflowFilter,
  setWorkspaceMode,
  setZoom,
  toggleGrid,
  toggleHelpers,
  updateActiveAssignment,
  updateSetup
} from './module-state.js';
import { captureSnapshot } from './module-renderer.js';
import { cloneTemplateAssignment, STARTER_TEMPLATES } from './module-library.js';
import { deleteLocalSave, exportJson, formatLocalSavesForDisplay, importJsonFile, loadLocalSave, readLocalSaves, saveLocal } from './module-io.js';
import { MODULE_ACCENTS, MODULE_LABEL, MODULE_SLUG, MODULE_THEME, MODULE_VERSION, WORKFLOW_STATES } from './module-config.js';

let suppressInputSync = false;

export function initUI() {
  applyTheme();
  populateSelects();
  wireMenus();
  wireTopLevelActions();
  wireInspector();
  wireResizablePanels();
  renderTemplateList();
  renderWorkflowTabs();

  onStateChange((state) => {
    syncInspector(state);
    renderAssignmentList(state);
    renderSubtasks();
    renderWorkflowTabs();
    updateStatus(state);
  });

  syncInspector(moduleState);
  renderAssignmentList(moduleState);
  renderSubtasks();
  updateStatus(moduleState);
}

export function showToast(message, type = 'success') {
  const area = document.getElementById('toast-area');
  if (!area) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  area.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function applyTheme() {
  document.documentElement.style.setProperty('--module-accent', MODULE_THEME.accent);
  document.documentElement.style.setProperty('--module-accent-soft', MODULE_THEME.accentSoft);
  document.documentElement.style.setProperty('--module-accent-strong', MODULE_THEME.accentStrong);
  document.documentElement.style.setProperty('--module-glow', MODULE_THEME.glow);
  setText('module-label', MODULE_LABEL);
  setText('version-badge', MODULE_VERSION);
}

function populateSelects() {
  const moduleSelect = byId('assignment-module-input');
  if (moduleSelect) {
    moduleSelect.innerHTML = '';
    Object.entries(MODULE_ACCENTS).forEach(([key, module]) => {
      moduleSelect.append(new Option(module.label, key));
    });
  }

  const stateSelect = byId('assignment-state-input');
  if (stateSelect) {
    stateSelect.innerHTML = '';
    WORKFLOW_STATES.forEach((state) => stateSelect.append(new Option(state, state)));
  }
}

function wireMenus() {
  document.querySelectorAll('.menu-button').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const menuName = button.dataset.menu;
      const panel = document.getElementById(`menu-${menuName}`);
      const isOpen = panel?.classList.contains('open');
      closeMenus();
      if (panel && !isOpen) panel.classList.add('open');
    });
  });

  document.addEventListener('click', closeMenus);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenus();
  });

  document.querySelectorAll('.menu-panel').forEach((panel) => panel.addEventListener('click', (event) => event.stopPropagation()));
}

function closeMenus() {
  document.querySelectorAll('.menu-panel.open').forEach((panel) => panel.classList.remove('open'));
}

function wireTopLevelActions() {
  byId('new-guide-button')?.addEventListener('click', () => {
    resetDocument();
    closeMenus();
    showToast('New Creation Guide created.', 'success');
  });

  byId('add-assignment-button')?.addEventListener('click', () => {
    addAssignment();
    closeMenus();
    showToast('Assignment added.', 'success');
  });

  byId('duplicate-assignment-button')?.addEventListener('click', () => {
    duplicateActiveAssignment();
    closeMenus();
    showToast('Assignment duplicated.', 'success');
  });

  byId('delete-assignment-button')?.addEventListener('click', () => {
    deleteActiveAssignment();
    closeMenus();
    showToast('Assignment deleted.', 'warn');
  });

  byId('open-detail-button')?.addEventListener('click', () => {
    showAssignmentDialog();
    closeMenus();
  });

  byId('export-json-button')?.addEventListener('click', () => {
    exportJson();
    closeMenus();
    showToast('Creation Guide JSON exported.', 'success');
  });

  byId('import-json-input')?.addEventListener('change', async (event) => {
    try {
      await importJsonFile(event.target.files?.[0]);
      showToast('Creation Guide JSON imported.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Could not import JSON.', 'error');
    } finally {
      event.target.value = '';
      closeMenus();
    }
  });

  byId('save-local-button')?.addEventListener('click', () => {
    saveLocal();
    closeMenus();
    showToast('Saved locally in this browser.', 'success');
  });

  byId('view-local-button')?.addEventListener('click', () => {
    showLocalDialog();
    closeMenus();
  });

  byId('toggle-grid-button')?.addEventListener('click', () => {
    toggleGrid();
    closeMenus();
  });

  byId('toggle-helpers-button')?.addEventListener('click', () => {
    toggleHelpers();
    closeMenus();
  });

  document.querySelectorAll('[data-workspace-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      setWorkspaceMode(button.dataset.workspaceMode);
      closeMenus();
    });
  });

  byId('zoom-out-button')?.addEventListener('click', () => setZoom(moduleState.zoom - 0.1));
  byId('zoom-in-button')?.addEventListener('click', () => setZoom(moduleState.zoom + 0.1));
  byId('zoom-reset-button')?.addEventListener('click', () => setZoom(1));

  byId('todo-sort-input')?.addEventListener('change', (event) => setTodoSort(event.target.value));

  byId('snapshot-button')?.addEventListener('click', () => {
    const dataUrl = captureSnapshot();
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${MODULE_SLUG}-snapshot.png`;
    link.click();
    showToast('Snapshot exported.', 'success');
  });

  byId('quick-start-button')?.addEventListener('click', () => {
    showHelpDialog('Quick Start Guide', `
      <p>Create or import a guide, add assignments from Insert, then move cards through the production states.</p>
      <p>The card accent colour shows the owning Artifex module. Workflow state is separate and appears as a chip or board filter.</p>
      <p>Use Priority and Effort to sort by easy wins, important work, old work, or almost complete assignments.</p>
    `);
    closeMenus();
  });

  byId('about-button')?.addEventListener('click', () => {
    showHelpDialog('About Creation Guide', `
      <p><strong>${MODULE_LABEL} ${MODULE_VERSION}</strong></p>
      <p>Creation Guide is the assignment planner, milestone tracker, production dashboard, checklist surface, and health-check module for Artifex.</p>
    `);
    closeMenus();
  });
}

function wireInspector() {
  bindInput('game-title-input', (value) => updateSetup({ gameTitle: value || 'Untitled Artifex Adventure' }));
  bindInput('creator-input', (value) => updateSetup({ creatorName: value }));
  bindInput('project-folder-input', (value) => updateSetup({ projectFolder: value }));
  bindInput('starting-character-input', (value) => updateSetup({ startingCharacter: value || 'Mel' }));
  bindInput('build-target-input', (value) => updateSetup({ buildTarget: value }));

  bindInput('assignment-title-input', (value) => updateActiveAssignment({ title: value || 'New Assignment' }));
  bindInput('assignment-module-input', (value) => updateActiveAssignment({ primaryModule: value }));
  bindInput('assignment-state-input', (value) => updateActiveAssignment({ state: value, archived: value === 'archived' }));
  bindInput('assignment-owner-input', (value) => updateActiveAssignment({ owner: value }));
  bindInput('assignment-priority-input', (value) => updateActiveAssignment({ priorityOverride: value }));
  bindInput('assignment-effort-input', (value) => updateActiveAssignment({ effortOverride: value }));
  bindInput('assignment-milestone-input', (value) => updateActiveAssignment({ milestoneId: value }));
  bindInput('assignment-zone-input', (value) => updateActiveAssignment({ zoneId: value }));
  bindInput('assignment-notes-input', (value) => updateActiveAssignment({ notes: value }));

  byId('add-subtask-button')?.addEventListener('click', () => {
    const input = byId('subtask-text-input');
    if (addSubtaskToActive(input?.value)) {
      input.value = '';
      showToast('Subtask added.', 'success');
    } else {
      showToast('Select an assignment and enter subtask text.', 'warn');
    }
  });
}

function bindInput(id, handler) {
  byId(id)?.addEventListener('input', (event) => {
    if (suppressInputSync) return;
    handler(event.target.value);
  });
}

function syncInspector(state) {
  suppressInputSync = true;
  const setup = state.document.setup || {};
  const assignment = getActiveAssignment();
  const hasAssignment = Boolean(assignment);

  setValue('game-title-input', setup.gameTitle || '');
  setValue('creator-input', setup.creatorName || '');
  setValue('project-folder-input', setup.projectFolder || '');
  setValue('starting-character-input', setup.startingCharacter || '');
  setValue('build-target-input', setup.buildTarget || 'Chronicle 0');
  setText('setup-percent', `${getSetupCompletion(setup)}%`);

  setValue('assignment-title-input', assignment?.title || '');
  setValue('assignment-module-input', assignment?.primaryModule || 'unassigned');
  setValue('assignment-state-input', assignment?.state || 'unassigned');
  setValue('assignment-owner-input', assignment?.owner || '');
  setValue('assignment-priority-input', assignment ? getEffectivePriority(assignment) : '');
  setValue('assignment-effort-input', assignment ? getEffectiveEffort(assignment) : '');
  setValue('assignment-milestone-input', assignment?.milestoneId || '');
  setValue('assignment-zone-input', assignment?.zoneId || '');
  setValue('assignment-notes-input', assignment?.notes || '');
  setText('assignment-percent', `${getCompletion(assignment)}%`);
  setText('zoom-readout', `${Math.round((state.zoom || 1) * 100)}%`);

  ['assignment-title-input', 'assignment-module-input', 'assignment-state-input', 'assignment-owner-input', 'assignment-priority-input', 'assignment-effort-input', 'assignment-milestone-input', 'assignment-zone-input', 'assignment-notes-input', 'subtask-text-input', 'add-subtask-button'].forEach((id) => {
    const element = byId(id);
    if (element) element.disabled = !hasAssignment;
  });

  suppressInputSync = false;
}

function renderAssignmentList(state) {
  const list = byId('assignment-list');
  if (!list) return;
  const visible = getVisibleAssignments();
  list.innerHTML = '';
  setText('assignment-count', `${state.document.assignments.length} assignments`);

  visible.forEach((assignment) => {
    const realIndex = state.document.assignments.indexOf(assignment);
    const module = MODULE_ACCENTS[assignment.primaryModule] || MODULE_ACCENTS.unassigned;
    const item = document.createElement('button');
    item.className = `assignment-item ${realIndex === state.activeAssignmentIndex ? 'selected' : ''}`;
    item.type = 'button';
    item.style.setProperty('--assignment-accent', module.accent);
    item.style.setProperty('--assignment-accent-soft', module.accentSoft);
    item.innerHTML = `
      <span class="assignment-icon">${escapeHtml(assignment.icon || module.icon)}</span>
      <span class="assignment-main"><strong>${escapeHtml(assignment.title)}</strong><span>${escapeHtml(module.label)} · ${escapeHtml(assignment.state)} · P${getEffectivePriority(assignment)} · E${getEffectiveEffort(assignment)}</span></span>
      <span class="assignment-progress">${getCompletion(assignment)}%</span>
    `;
    item.addEventListener('click', () => selectAssignment(realIndex));
    item.addEventListener('dblclick', () => showAssignmentDialog());
    list.appendChild(item);
  });
}

function renderSubtasks() {
  const list = byId('subtask-list');
  if (!list) return;
  const assignment = getActiveAssignment();
  list.innerHTML = '';
  if (!assignment) {
    list.innerHTML = '<p class="empty-note">Select an assignment to edit subtasks.</p>';
    return;
  }

  if (!assignment.subtasks.length) {
    list.innerHTML = '<p class="empty-note">No subtasks yet.</p>';
    return;
  }

  assignment.subtasks.forEach((subtask) => {
    const row = document.createElement('article');
    row.className = `subtask-row ${subtask.status}`;
    row.innerHTML = `
      <div><strong>${escapeHtml(subtask.text)}</strong><span>${escapeHtml(subtask.status)}</span></div>
      <div class="subtask-actions"></div>
    `;
    const actions = row.querySelector('.subtask-actions');
    ['open', 'complete', 'confirmed', 'blocked', 'not-needed'].forEach((status) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = status === 'not-needed' ? 'skip' : status;
      button.addEventListener('click', () => setSubtaskStatus(subtask.id, status));
      actions.appendChild(button);
    });
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = '×';
    remove.addEventListener('click', () => deleteSubtask(subtask.id));
    actions.appendChild(remove);
    list.appendChild(row);
  });
}

function renderWorkflowTabs() {
  const tabs = byId('assignment-tabs');
  if (!tabs) return;
  const filters = ['undone', 'all', ...WORKFLOW_STATES];
  tabs.innerHTML = '';
  filters.forEach((filter) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = filter === moduleState.activeWorkflowFilter ? 'active' : '';
    button.textContent = filter;
    button.addEventListener('click', () => setWorkflowFilter(filter));
    tabs.appendChild(button);
  });
}

function renderTemplateList() {
  const list = byId('template-list');
  if (!list) return;
  list.innerHTML = '';
  STARTER_TEMPLATES.forEach((template) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = `<strong>${escapeHtml(template.name)}</strong><br><small>${escapeHtml(template.description)}</small>`;
    button.addEventListener('click', () => {
      addAssignment(cloneTemplateAssignment(template.id));
      closeMenus();
      showToast(`${template.name} added.`, 'success');
    });
    list.appendChild(button);
  });
}

function updateStatus() {
  const active = getActiveAssignment();
  setText('status-text', active ? `Editing ${active.title}` : 'Ready.');
}

function showAssignmentDialog() {
  const assignment = getActiveAssignment();
  const dialog = byId('assignment-dialog');
  const title = byId('assignment-dialog-title');
  const body = byId('assignment-dialog-body');
  if (!assignment || !dialog || !title || !body) {
    showToast('Select an assignment first.', 'warn');
    return;
  }
  const module = MODULE_ACCENTS[assignment.primaryModule] || MODULE_ACCENTS.unassigned;
  dialog.style.setProperty('--dialog-accent', module.accent);
  title.textContent = assignment.title;
  body.innerHTML = `
    <section class="assignment-detail" style="--assignment-accent:${module.accent};--assignment-accent-soft:${module.accentSoft};">
      <div class="detail-badge"><span>${escapeHtml(assignment.icon || module.icon)}</span><strong>${escapeHtml(module.label)}</strong></div>
      <p>${escapeHtml(assignment.description || assignment.notes || 'No description yet.')}</p>
      <div class="detail-grid">
        <span>State</span><strong>${escapeHtml(assignment.state)}</strong>
        <span>Owner</span><strong>${escapeHtml(assignment.owner || 'Unassigned')}</strong>
        <span>Priority</span><strong>${getEffectivePriority(assignment)} / 5</strong>
        <span>Effort</span><strong>${getEffectiveEffort(assignment)} / 5</strong>
        <span>Milestone</span><strong>${escapeHtml(assignment.milestoneId || 'None')}</strong>
        <span>Zone / Scene</span><strong>${escapeHtml(assignment.zoneId || assignment.sceneId || 'None')}</strong>
        <span>Linked File</span><strong>${escapeHtml(assignment.linkedFile || 'None')}</strong>
        <span>Progress</span><strong>${getCompletion(assignment)}%</strong>
      </div>
      <h3>Subtasks</h3>
      <ul>${assignment.subtasks.map((item) => `<li>${escapeHtml(item.status)} — ${escapeHtml(item.text)}</li>`).join('') || '<li>No subtasks yet.</li>'}</ul>
    </section>
  `;
  dialog.showModal();
}

function showLocalDialog() {
  const dialog = byId('local-dialog');
  const output = byId('local-files-output');
  if (!dialog || !output) return;
  const saves = readLocalSaves();
  output.textContent = formatLocalSavesForDisplay();
  if (Object.keys(saves).length) {
    window.artifexCreationGuideSaves = {
      list: readLocalSaves,
      load: (id) => loadLocalSave(id),
      delete: (id) => deleteLocalSave(id)
    };
    output.textContent += '\n\nConsole helpers:';
    output.textContent += '\nwindow.artifexCreationGuideSaves.load("save-id")';
    output.textContent += '\nwindow.artifexCreationGuideSaves.delete("save-id")';
  }
  dialog.showModal();
}

function showHelpDialog(title, html) {
  setText('help-dialog-title', title);
  const body = byId('help-dialog-body');
  if (body) body.innerHTML = html;
  byId('help-dialog')?.showModal();
}

function wireResizablePanels() {
  makeHorizontalResizer('side-resizer', 'left-panel', { min: 245, max: 560 });
  makeVerticalResizer('bottom-resizer', 'bottom-panel', { min: 100, max: 460 });
}

function makeHorizontalResizer(resizerId, panelId, limits) {
  const resizer = byId(resizerId);
  const panel = byId(panelId);
  if (!resizer || !panel) return;
  resizer.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    resizer.setPointerCapture(event.pointerId);
    const onMove = (moveEvent) => {
      const width = Math.max(limits.min, Math.min(limits.max, moveEvent.clientX));
      panel.style.width = `${width}px`;
    };
    const onUp = () => {
      resizer.removeEventListener('pointermove', onMove);
      resizer.removeEventListener('pointerup', onUp);
    };
    resizer.addEventListener('pointermove', onMove);
    resizer.addEventListener('pointerup', onUp);
  });
}

function makeVerticalResizer(resizerId, panelId, limits) {
  const resizer = byId(resizerId);
  const panel = byId(panelId);
  if (!resizer || !panel) return;
  resizer.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    resizer.setPointerCapture(event.pointerId);
    const startY = event.clientY;
    const startHeight = panel.getBoundingClientRect().height;
    const onMove = (moveEvent) => {
      const next = Math.max(limits.min, Math.min(limits.max, startHeight - (moveEvent.clientY - startY)));
      panel.style.height = `${next}px`;
    };
    const onUp = () => {
      resizer.removeEventListener('pointermove', onMove);
      resizer.removeEventListener('pointerup', onUp);
    };
    resizer.addEventListener('pointermove', onMove);
    resizer.addEventListener('pointerup', onUp);
  });
}

function getSetupCompletion(setup) {
  const checks = [
    setup.gameTitle && setup.gameTitle !== 'Untitled Artifex Adventure',
    setup.creatorName,
    setup.projectFolder,
    setup.startingCharacter,
    setup.buildTarget
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function byId(id) {
  return document.getElementById(id);
}

function setValue(id, value) {
  const element = byId(id);
  if (element) element.value = value ?? '';
}

function setText(id, value) {
  const element = byId(id);
  if (element) element.textContent = value ?? '';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}
