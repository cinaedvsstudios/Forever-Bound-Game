import { editorState, loadComposition, serializeComposition } from './editor-state.js';

const STORAGE_PREFIX = 'artifex-effect-editor-modular-test';
const BACKUP_PREFIX = 'artifex-effect-editor-modular-test-backup';
const EXPORT_SCHEMA = 'artifex.effectArchetype.v1';

export function exportJSON() {
  downloadJSON(`${getArchetypeId()}.raw-composition.json`, getSyncedComposition());
}

export function exportEditorProject() {
  downloadJSON(`${getArchetypeId()}.editor-project.json`, buildProjectPayload());
}

export function exportEffectArchetypeAsset() {
  downloadJSON(`${getArchetypeId()}.effect-archetype.json`, buildEffectArchetypePayload());
}

export function exportSceneFXInstance() {
  downloadJSON(`${getArchetypeId()}.scene-fx-instance.json`, {
    schema: 'artifex.sceneFxInstance.v1',
    exportedAt: new Date().toISOString(),
    archetypeId: getArchetypeId(),
    position: { x: 0, y: 0, z: 0 },
    scale: 1,
    rotation: 0,
    playback: {
      autoplay: true,
      loop: true,
      startDelay: 0
    },
    source: buildEffectArchetypePayload()
  });
}

export async function importJSONFromFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const composition = unwrapComposition(parsed);
    loadComposition(composition);
    setArchetypeId(composition.id || parsed.id || getArchetypeId());
    emitToast(`Imported ${file.name}.`, 'success');
  } catch (error) {
    emitToast(`Import failed: ${error.message}`, 'error');
  } finally {
    event.target.value = '';
  }
}

export function saveToLocalStorage() {
  const payload = buildEffectArchetypePayload();
  localStorage.setItem(`${STORAGE_PREFIX}:${payload.id}`, JSON.stringify(payload));
  localStorage.setItem(`${BACKUP_PREFIX}:${payload.id}:${Date.now()}`, JSON.stringify(payload));
  emitToast(`Saved ${payload.id} with thumbnail backup.`, 'success');
}

export function emergencyBackupSave() {
  const payload = buildProjectPayload();
  const key = `${BACKUP_PREFIX}:emergency:${payload.id}:${Date.now()}`;
  localStorage.setItem(key, JSON.stringify(payload));
  downloadJSON(`${payload.id}.emergency-backup.json`, payload);
  emitToast('Emergency backup saved locally and downloaded.', 'success');
}

export function showLocalFiles() {
  const dialog = document.getElementById('local-dialog');
  ensureLocalDialogLayout();
  renderLocalFilesList();
  dialog.showModal();
}

export function exportLocalBundle() {
  const rows = readSavedRows();
  downloadJSON(`artifex-local-effects-${dateStamp()}.json`, {
    schema: 'artifex.localEffectsBundle.v1',
    exportedAt: new Date().toISOString(),
    count: rows.length,
    items: rows.map((row) => row.payload)
  });
  emitToast(`Exported ${rows.length} local effect file${rows.length === 1 ? '' : 's'}.`, 'success');
}

export function buildEffectArchetypePayload() {
  const composition = getSyncedComposition();
  return {
    schema: EXPORT_SCHEMA,
    id: composition.id,
    name: composition.name,
    exportedAt: new Date().toISOString(),
    thumbnail: captureThumbnail('image/jpeg', 0.9),
    thumbnailFilename: `${composition.id}.jpg`,
    engine: 'artifex-modular-test',
    composition
  };
}

export function buildProjectPayload() {
  const composition = getSyncedComposition();
  return {
    schema: 'artifex.editorProject.v1',
    id: composition.id,
    name: composition.name,
    exportedAt: new Date().toISOString(),
    editor: {
      version: document.getElementById('version-badge')?.textContent || 'modular-test',
      workspaceMode: editorState.workspaceMode,
      zoom: editorState.zoom,
      showGrid: editorState.showGrid,
      showHelpers: editorState.showHelpers
    },
    thumbnail: captureThumbnail('image/jpeg', 0.9),
    composition
  };
}

function getSyncedComposition() {
  const id = getArchetypeId();
  const firstLayerName = editorState.composition.layers[0]?.name;
  return {
    ...editorState.composition,
    id,
    name: firstLayerName || editorState.composition.name || id,
    updatedAt: new Date().toISOString()
  };
}

function unwrapComposition(parsed) {
  if (parsed?.composition?.layers) return parsed.composition;
  if (parsed?.source?.composition?.layers) return parsed.source.composition;
  if (parsed?.layers) return parsed;
  throw new Error('No composition/layers found in JSON.');
}

function ensureLocalDialogLayout() {
  const form = document.querySelector('#local-dialog form');
  const output = document.getElementById('local-files-output');
  if (!form || !output || document.getElementById('local-files-list')) return;

  output.style.display = 'none';
  output.insertAdjacentHTML('afterend', `
    <style>
      .local-files-toolbar { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
      .local-files-toolbar button { min-height: 34px; }
      .local-files-list { display: grid; gap: 10px; margin-top: 10px; max-height: 55vh; overflow: auto; }
      .local-file-card { border: 1px solid var(--border); border-radius: 14px; padding: 10px; background: rgba(15,12,11,.64); display: grid; grid-template-columns: 96px 1fr; gap: 10px; }
      .local-file-thumb { width: 96px; height: 54px; border-radius: 9px; border: 1px solid rgba(226,204,167,.18); object-fit: cover; background: #050405; }
      .local-file-meta strong { display: block; color: var(--gold-bright); margin-bottom: 4px; }
      .local-file-meta span { display: block; color: var(--muted); font-size: 11px; margin-bottom: 7px; }
      .local-file-actions { display: flex; flex-wrap: wrap; gap: 6px; }
      .local-file-actions button { min-height: 30px; padding: 6px 9px; font-size: 11px; }
    </style>
    <div class="local-files-toolbar">
      <button id="export-local-bundle-button" type="button">Export All Local</button>
      <button id="emergency-backup-button" type="button">Emergency Backup Save</button>
    </div>
    <div id="local-files-list" class="local-files-list"></div>
  `);

  document.getElementById('export-local-bundle-button')?.addEventListener('click', exportLocalBundle);
  document.getElementById('emergency-backup-button')?.addEventListener('click', emergencyBackupSave);
}

function renderLocalFilesList() {
  const list = document.getElementById('local-files-list');
  const output = document.getElementById('local-files-output');
  const rows = readSavedRows();
  if (!list || !output) return;

  output.textContent = rows.length
    ? rows.map((row) => row.id).join('\n')
    : 'No local modular-test effects saved yet.';

  if (!rows.length) {
    list.innerHTML = '<div class="local-file-card"><div></div><div class="local-file-meta"><strong>No local effects saved yet.</strong><span>Use File > Save to Local Storage first.</span></div></div>';
    return;
  }

  list.innerHTML = '';
  for (const row of rows) {
    const card = document.createElement('article');
    card.className = 'local-file-card';
    const thumb = row.payload.thumbnail || '';
    card.innerHTML = `
      <img class="local-file-thumb" alt="${escapeHtml(row.id)} thumbnail" src="${thumb}" />
      <div class="local-file-meta">
        <strong>${escapeHtml(row.id)}</strong>
        <span>${escapeHtml(row.payload.exportedAt || row.payload.savedAt || 'saved locally')} · ${row.layerCount} layer${row.layerCount === 1 ? '' : 's'}</span>
        <div class="local-file-actions">
          <button type="button" data-action="load">Load</button>
          <button type="button" data-action="export">Export</button>
          <button type="button" data-action="delete">Delete</button>
        </div>
      </div>
    `;
    card.querySelector('[data-action="load"]').addEventListener('click', () => {
      loadComposition(unwrapComposition(row.payload));
      setArchetypeId(row.id);
      document.getElementById('local-dialog')?.close();
      emitToast(`${row.id} loaded.`, 'success');
    });
    card.querySelector('[data-action="export"]').addEventListener('click', () => {
      downloadJSON(`${row.id}.effect-archetype.json`, row.payload);
    });
    card.querySelector('[data-action="delete"]').addEventListener('click', () => {
      localStorage.removeItem(row.key);
      renderLocalFilesList();
      emitToast(`${row.id} deleted from local storage.`, 'warn');
    });
    list.append(card);
  }
}

function readSavedRows() {
  const rows = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key?.startsWith(`${STORAGE_PREFIX}:`)) continue;
    try {
      const payload = JSON.parse(localStorage.getItem(key));
      const composition = unwrapComposition(payload);
      const id = payload.id || composition.id || key.replace(`${STORAGE_PREFIX}:`, '');
      rows.push({
        key,
        id,
        payload,
        layerCount: Array.isArray(composition.layers) ? composition.layers.length : 0
      });
    } catch {
      rows.push({
        key,
        id: key.replace(`${STORAGE_PREFIX}:`, ''),
        payload: { id: key, composition: { layers: [] } },
        layerCount: 0
      });
    }
  }
  rows.sort((a, b) => String(a.id).localeCompare(String(b.id)));
  return rows;
}

function captureThumbnail(type = 'image/jpeg', quality = 0.9) {
  const canvas = document.getElementById('fx-canvas');
  try {
    return canvas ? canvas.toDataURL(type, quality) : '';
  } catch {
    return '';
  }
}

function getArchetypeId() {
  const input = document.getElementById('archetype-id-input');
  const raw = input?.value || editorState.composition.id || 'effect-archetype';
  const safe = String(raw).trim().replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '');
  return safe || 'effect-archetype';
}

function setArchetypeId(id) {
  const input = document.getElementById('archetype-id-input');
  if (input) input.value = String(id || '').trim() || 'effect-archetype';
}

function downloadJSON(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

function dateStamp() {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}

function emitToast(message, type) {
  window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message, type } }));
}
