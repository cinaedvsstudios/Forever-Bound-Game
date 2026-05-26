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
  emitToast(`Saved ${payload.id} locally with ${payload.thumbnailSource} thumbnail.`, 'success');
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

export function showJSONPanel(mode = 'view') {
  ensureJSONDialogLayout();
  const dialog = document.getElementById('json-dialog');
  const title = document.getElementById('json-dialog-title');
  const editor = document.getElementById('json-dialog-textarea');
  const applyButton = document.getElementById('json-apply-button');
  const exportButton = document.getElementById('json-export-button');
  const boilerplate = mode === 'boilerplate';

  title.textContent = boilerplate ? 'Effect Boilerplate' : mode === 'edit' ? 'Edit Effect JSON' : 'View Effect JSON';
  editor.readOnly = mode !== 'edit';
  editor.value = boilerplate ? buildBoilerplateText() : serializeComposition();
  applyButton.hidden = mode !== 'edit';
  exportButton.textContent = boilerplate ? 'Export Boilerplate TXT' : 'Export JSON';
  exportButton.onclick = () => {
    if (boilerplate) exportBoilerplate();
    else downloadText(`${getArchetypeId()}.json`, editor.value, 'application/json');
  };
  applyButton.onclick = () => {
    try {
      const parsed = JSON.parse(editor.value);
      loadComposition(unwrapComposition(parsed));
      emitToast('JSON applied to current composition.', 'success');
      dialog.close();
    } catch (error) {
      emitToast(`JSON apply failed: ${error.message}`, 'error');
    }
  };
  dialog.showModal();
}

export function exportBoilerplate() {
  downloadText(`${getArchetypeId()}.boilerplate.txt`, buildBoilerplateText(), 'text/plain');
  emitToast('Boilerplate exported.', 'success');
}

export function buildEffectArchetypePayload() {
  const composition = getSyncedComposition();
  const thumbnailInfo = getThumbnailInfo();
  return {
    schema: EXPORT_SCHEMA,
    id: composition.id,
    name: composition.name,
    exportedAt: new Date().toISOString(),
    thumbnail: thumbnailInfo.dataUrl,
    thumbnailSource: thumbnailInfo.source,
    thumbnailFilename: `${composition.id}.jpg`,
    engine: 'artifex-modular-test',
    composition
  };
}

export function buildProjectPayload() {
  const composition = getSyncedComposition();
  const thumbnailInfo = getThumbnailInfo();
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
      showHelpers: editorState.showHelpers,
      lowPerformanceMode: editorState.lowPerformanceMode,
      moduleTheme: editorState.moduleTheme
    },
    thumbnail: thumbnailInfo.dataUrl,
    thumbnailSource: thumbnailInfo.source,
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
      .local-files-toolbar { display: grid; grid-template-columns: 1fr auto auto auto; gap: 8px; margin: 12px 0; align-items: center; }
      .local-files-toolbar input { min-width: 0; }
      .local-files-toolbar button { min-height: 34px; }
      .local-files-list { display: grid; gap: 10px; margin-top: 10px; max-height: 55vh; overflow: auto; }
      .local-file-card { border: 1px solid var(--border); border-radius: 14px; padding: 10px; background: rgba(15,12,11,.64); display: grid; grid-template-columns: 112px 1fr; gap: 10px; }
      .local-file-thumb { width: 112px; height: 63px; border-radius: 9px; border: 1px solid rgba(226,204,167,.18); object-fit: cover; background: #050405; }
      .local-file-meta strong { display: block; color: var(--gold-bright); margin-bottom: 4px; }
      .local-file-meta span { display: block; color: var(--muted); font-size: 11px; margin-bottom: 7px; }
      .local-file-actions { display: flex; flex-wrap: wrap; gap: 6px; }
      .local-file-actions button { min-height: 30px; padding: 6px 9px; font-size: 11px; }
      @media (max-width: 720px) { .local-files-toolbar { grid-template-columns: 1fr 1fr; } .local-file-card { grid-template-columns: 1fr; } .local-file-thumb { width: 100%; height: 120px; } }
    </style>
    <div class="local-files-toolbar">
      <input id="local-file-search" type="search" placeholder="Search local effects" />
      <button id="export-local-bundle-button" type="button">Export All</button>
      <button id="emergency-backup-button" type="button">Backup</button>
      <button id="delete-all-local-button" type="button">Delete All</button>
    </div>
    <div id="local-files-list" class="local-files-list"></div>
  `);

  document.getElementById('export-local-bundle-button')?.addEventListener('click', exportLocalBundle);
  document.getElementById('emergency-backup-button')?.addEventListener('click', emergencyBackupSave);
  document.getElementById('delete-all-local-button')?.addEventListener('click', deleteAllLocalEffects);
  document.getElementById('local-file-search')?.addEventListener('input', renderLocalFilesList);
}

function renderLocalFilesList() {
  const list = document.getElementById('local-files-list');
  const output = document.getElementById('local-files-output');
  const query = String(document.getElementById('local-file-search')?.value || '').trim().toLowerCase();
  const rows = readSavedRows().filter((row) => !query || row.id.toLowerCase().includes(query) || row.name.toLowerCase().includes(query));
  if (!list || !output) return;

  output.textContent = rows.length
    ? rows.map((row) => row.id).join('\n')
    : 'No matching local modular-test effects saved yet.';

  if (!rows.length) {
    list.innerHTML = '<div class="local-file-card"><div></div><div class="local-file-meta"><strong>No local effects found.</strong><span>Use File > Save Locally in Browser first.</span></div></div>';
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
        <span>${escapeHtml(row.name)} · ${escapeHtml(row.payload.exportedAt || row.payload.savedAt || 'saved locally')} · ${row.layerCount} layer${row.layerCount === 1 ? '' : 's'}</span>
        <div class="local-file-actions">
          <button type="button" data-action="load">Load</button>
          <button type="button" data-action="duplicate">Duplicate</button>
          <button type="button" data-action="rename">Rename</button>
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
    card.querySelector('[data-action="duplicate"]').addEventListener('click', () => duplicateLocalEffect(row));
    card.querySelector('[data-action="rename"]').addEventListener('click', () => renameLocalEffect(row));
    card.querySelector('[data-action="export"]').addEventListener('click', () => downloadJSON(`${row.id}.effect-archetype.json`, row.payload));
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
        name: payload.name || composition.name || id,
        payload,
        layerCount: Array.isArray(composition.layers) ? composition.layers.length : 0
      });
    } catch {
      rows.push({
        key,
        id: key.replace(`${STORAGE_PREFIX}:`, ''),
        name: key.replace(`${STORAGE_PREFIX}:`, ''),
        payload: { id: key, composition: { layers: [] } },
        layerCount: 0
      });
    }
  }
  rows.sort((a, b) => String(b.payload.exportedAt || '').localeCompare(String(a.payload.exportedAt || '')) || String(a.id).localeCompare(String(b.id)));
  return rows;
}

function duplicateLocalEffect(row) {
  const nextId = uniqueLocalId(`${row.id}-copy`);
  const payload = structuredCloneSafe(row.payload);
  payload.id = nextId;
  payload.name = `${row.name} Copy`;
  payload.exportedAt = new Date().toISOString();
  if (payload.composition) {
    payload.composition.id = nextId;
    payload.composition.name = payload.name;
  }
  localStorage.setItem(`${STORAGE_PREFIX}:${nextId}`, JSON.stringify(payload));
  renderLocalFilesList();
  emitToast(`${nextId} duplicated.`, 'success');
}

function renameLocalEffect(row) {
  const nextId = prompt('New local effect ID', row.id);
  if (!nextId) return;
  const safeId = sanitizeId(nextId);
  if (!safeId) return;
  const payload = structuredCloneSafe(row.payload);
  payload.id = safeId;
  payload.name = safeId;
  payload.exportedAt = new Date().toISOString();
  if (payload.composition) {
    payload.composition.id = safeId;
    payload.composition.name = safeId;
  }
  localStorage.removeItem(row.key);
  localStorage.setItem(`${STORAGE_PREFIX}:${safeId}`, JSON.stringify(payload));
  renderLocalFilesList();
  emitToast(`${row.id} renamed to ${safeId}.`, 'success');
}

function deleteAllLocalEffects() {
  const rows = readSavedRows();
  if (!rows.length) return;
  if (!confirm(`Delete all ${rows.length} local effect${rows.length === 1 ? '' : 's'}?`)) return;
  rows.forEach((row) => localStorage.removeItem(row.key));
  renderLocalFilesList();
  emitToast('All local effects deleted.', 'warn');
}

function ensureJSONDialogLayout() {
  if (document.getElementById('json-dialog')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <dialog id="json-dialog">
      <form method="dialog">
        <header class="dialog-header">
          <h2 id="json-dialog-title">Effect JSON</h2>
          <button value="close" title="Close panel">×</button>
        </header>
        <style>
          .json-dialog-actions { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; }
          #json-dialog-textarea { width: 100%; min-height: 52vh; resize: vertical; font-family: 'Fira Code', monospace; font-size: 11px; line-height: 1.45; }
        </style>
        <div class="json-dialog-actions">
          <button id="json-apply-button" type="button">Apply JSON</button>
          <button id="json-export-button" type="button">Export JSON</button>
        </div>
        <textarea id="json-dialog-textarea" spellcheck="false"></textarea>
      </form>
    </dialog>
  `);
}

function buildBoilerplateText() {
  const composition = getSyncedComposition();
  const layers = composition.layers || [];
  return [
    `ARTIFEX EFFECT BOILERPLATE`,
    `ID: ${composition.id}`,
    `Name: ${composition.name}`,
    `Stage: ${composition.designWidth || 1280}×${composition.designHeight || 720}`,
    `Layers: ${layers.length}`,
    ``,
    `Runtime usage:`,
    `1. Load the exported Effect Archetype JSON into the Artifex runtime.`,
    `2. Spawn this archetype by ID: ${composition.id}.`,
    `3. Use the scene FX instance export when placing this effect in a level/scene.`,
    ``,
    `Layer summary:`,
    ...layers.map((layer, index) => `${index + 1}. ${layer.name || 'Layer'} — ${layer.engine || 'particles'} — density ${layer.spawnRate ?? 0} — lifetime ${layer.lifetime ?? 0}`),
    ``,
    `Suggested scene instance:`,
    JSON.stringify({
      archetypeId: composition.id,
      position: { x: 0, y: 0, z: 0 },
      scale: 1,
      rotation: 0,
      autoplay: true,
      loop: true
    }, null, 2)
  ].join('\n');
}

function getThumbnailInfo() {
  const captured = globalThis.ArtifexCapturedThumbnailDataUrl || '';
  if (captured) return { dataUrl: captured, source: 'captured-preview' };
  return { dataUrl: captureThumbnail('image/jpeg', 0.9), source: 'auto-current-canvas' };
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
  return sanitizeId(raw) || 'effect-archetype';
}

function setArchetypeId(id) {
  const input = document.getElementById('archetype-id-input');
  if (input) input.value = sanitizeId(id) || 'effect-archetype';
}

function sanitizeId(raw) {
  return String(raw || '').trim().replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '');
}

function uniqueLocalId(base) {
  let id = sanitizeId(base) || 'effect-copy';
  let suffix = 2;
  while (localStorage.getItem(`${STORAGE_PREFIX}:${id}`)) {
    id = `${sanitizeId(base)}-${suffix}`;
    suffix += 1;
  }
  return id;
}

function downloadJSON(filename, payload) {
  downloadText(filename, JSON.stringify(payload, null, 2), 'application/json');
}

function downloadText(filename, text, type) {
  const blob = new Blob([text], { type });
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

function structuredCloneSafe(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
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
