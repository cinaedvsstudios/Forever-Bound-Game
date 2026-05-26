import {
  addRecord,
  deleteActiveRecord,
  duplicateActiveRecord,
  getActiveRecord,
  moduleState,
  onStateChange,
  removeActiveRecordProperty,
  resetDocument,
  selectRecord,
  setActiveRecordProperty,
  setWorkspaceMode,
  setZoom,
  toggleGrid,
  toggleHelpers,
  updateActiveRecord,
  updateDocument
} from './module-state.js';
import { captureSnapshot } from './module-renderer.js';
import { cloneTemplateRecord, STARTER_TEMPLATES } from './module-library.js';
import { deleteLocalSave, exportJson, formatLocalSavesForDisplay, importJsonFile, loadLocalSave, readLocalSaves, saveLocal } from './module-io.js';
import { MODULE_LABEL, MODULE_SLUG, MODULE_THEME, MODULE_VERSION } from './module-config.js';

let suppressInputSync = false;

export function initUI() {
  applyTheme();
  wireMenus();
  wireTopLevelActions();
  wireInspector();
  wireResizablePanels();
  renderTemplateList();

  onStateChange((state) => {
    syncInspector(state);
    renderRecordList(state);
    updateStatus(state);
  });

  syncInspector(moduleState);
  renderRecordList(moduleState);
  updateStatus(moduleState);
}

export function showToast(message, type = 'success') {
  const area = document.getElementById('toast-area');
  if (!area) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  area.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function applyTheme() {
  document.documentElement.style.setProperty('--module-accent', MODULE_THEME.accent);
  document.documentElement.style.setProperty('--module-accent-soft', MODULE_THEME.accentSoft);
  document.documentElement.style.setProperty('--module-accent-strong', MODULE_THEME.accentStrong);
  document.documentElement.style.setProperty('--module-glow', MODULE_THEME.glow);

  setText('module-label', MODULE_LABEL);
  setText('version-badge', MODULE_VERSION);
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

  document.querySelectorAll('.menu-panel').forEach((panel) => {
    panel.addEventListener('click', (event) => event.stopPropagation());
  });
}

function closeMenus() {
  document.querySelectorAll('.menu-panel.open').forEach((panel) => panel.classList.remove('open'));
}

function wireTopLevelActions() {
  byId('new-module-button')?.addEventListener('click', () => {
    resetDocument();
    closeMenus();
    showToast('New blank module data created.', 'success');
  });

  byId('add-record-button')?.addEventListener('click', () => {
    addRecord();
    closeMenus();
    showToast('Record added.', 'success');
  });

  byId('duplicate-record-button')?.addEventListener('click', () => {
    duplicateActiveRecord();
    closeMenus();
    showToast('Record duplicated.', 'success');
  });

  byId('delete-record-button')?.addEventListener('click', () => {
    deleteActiveRecord();
    closeMenus();
    showToast('Record deleted.', 'warn');
  });

  byId('export-json-button')?.addEventListener('click', () => {
    exportJson();
    closeMenus();
    showToast('JSON exported.', 'success');
  });

  byId('import-json-input')?.addEventListener('change', async (event) => {
    try {
      await importJsonFile(event.target.files?.[0]);
      showToast('JSON imported.', 'success');
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
      <p>This is a blank Artifex module shell.</p>
      <p>Use <strong>Insert → Add Generic Record</strong> to create one record, edit it in the left panel, then export JSON from the File menu.</p>
      <p>When turning this into a real module, replace the generic record fields with module-specific controls.</p>
    `);
    closeMenus();
  });

  byId('about-button')?.addEventListener('click', () => {
    showHelpDialog('About This Boilerplate', `
      <p><strong>${MODULE_LABEL} ${MODULE_VERSION}</strong></p>
      <p>This boilerplate exists so new Artifex modules can start with the same basic architecture: menu shell, inspector, workspace, record list, JSON import/export, and local browser saves.</p>
    `);
    closeMenus();
  });
}

function wireInspector() {
  bindInput('module-id-input', (value) => updateDocument({ id: value || moduleState.document.id }));
  bindInput('module-name-input', (value) => updateDocument({ name: value || 'Untitled Module Data' }));
  bindInput('module-kind-input', (value) => updateDocument({ moduleKind: value || MODULE_SLUG }));

  bindInput('record-name-input', (value) => updateActiveRecord({ name: value || 'New Record' }));
  bindInput('record-type-input', (value) => updateActiveRecord({ type: value || 'generic' }));
  bindInput('record-category-input', (value) => updateActiveRecord({ category: value || 'uncategorised' }));
  bindInput('record-tags-input', (value) => updateActiveRecord({ tags: value }));
  bindInput('record-notes-input', (value) => updateActiveRecord({ notes: value }));

  byId('set-property-button')?.addEventListener('click', () => {
    const key = byId('property-key-input')?.value;
    const value = byId('property-value-input')?.value;
    if (setActiveRecordProperty(key, value)) {
      showToast('Property set.', 'success');
    } else {
      showToast('Select a record and enter a property key.', 'warn');
    }
  });

  byId('remove-property-button')?.addEventListener('click', () => {
    const key = byId('property-key-input')?.value;
    if (removeActiveRecordProperty(key)) {
      showToast('Property removed.', 'warn');
    } else {
      showToast('Property not found.', 'warn');
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

  setValue('module-id-input', state.document.id);
  setValue('module-name-input', state.document.name);
  setValue('module-kind-input', state.document.moduleKind);

  const record = getActiveRecord();
  const hasRecord = Boolean(record);

  setValue('record-name-input', record?.name || '');
  setValue('record-type-input', record?.type || '');
  setValue('record-category-input', record?.category || '');
  setValue('record-tags-input', record?.tags?.join(', ') || '');
  setValue('record-notes-input', record?.notes || '');

  ['record-name-input', 'record-type-input', 'record-category-input', 'record-tags-input', 'record-notes-input', 'property-key-input', 'property-value-input'].forEach((id) => {
    const element = byId(id);
    if (element) element.disabled = !hasRecord;
  });

  setText('properties-output', JSON.stringify(record?.properties || {}, null, 2));
  setText('zoom-readout', `${Math.round((state.zoom || 1) * 100)}%`);

  suppressInputSync = false;
}

function renderRecordList(state) {
  const list = byId('record-list');
  if (!list) return;

  list.innerHTML = '';
  setText('record-count', `${state.document.records.length} records`);

  state.document.records.forEach((record, index) => {
    const item = document.createElement('button');
    item.className = `record-item ${index === state.activeRecordIndex ? 'selected' : ''}`;
    item.type = 'button';
    item.innerHTML = `<strong>${escapeHtml(record.name)}</strong><span>${escapeHtml(record.type)} / ${escapeHtml(record.category)}</span>`;
    item.addEventListener('click', () => selectRecord(index));
    list.appendChild(item);
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
      addRecord(cloneTemplateRecord(template.id));
      closeMenus();
      showToast(`${template.name} added.`, 'success');
    });
    list.appendChild(button);
  });
}

function updateStatus(state) {
  const active = getActiveRecord();
  const text = active ? `Editing ${active.name}` : 'Ready.';
  setText('status-text', text);
}

function showLocalDialog() {
  const dialog = byId('local-dialog');
  const output = byId('local-files-output');
  if (!dialog || !output) return;

  const saves = readLocalSaves();
  const baseText = formatLocalSavesForDisplay();
  const entries = Object.entries(saves);

  output.textContent = baseText;

  if (entries.length) {
    output.textContent += '\n\nTo load/delete from code quickly, use the browser console helpers:';
    window.artifexLocalSaves = {
      list: readLocalSaves,
      load: (id) => loadLocalSave(id),
      delete: (id) => deleteLocalSave(id)
    };
    output.textContent += '\nwindow.artifexLocalSaves.load("save-id")';
    output.textContent += '\nwindow.artifexLocalSaves.delete("save-id")';
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
  makeVerticalResizer('bottom-resizer', 'bottom-panel', { min: 86, max: 420 });
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
