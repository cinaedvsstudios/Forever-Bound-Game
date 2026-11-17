import { clearParticles, editorState, loadComposition } from './editor-state.js';

const STORAGE_PREFIX = 'artifex-index2-effect:';
const STORAGE_INDEX = 'artifex-index2-effect-index';
const MAX_LOCAL_SAVES = 25;
let toast = () => {};

export function initEditorPersistence(showToast = () => {}) {
  toast = typeof showToast === 'function' ? showToast : () => {};
  bind('export-json-button', exportCompositionJson);
  bind('save-local-button', saveCompositionLocal);
  bind('load-local-button', loadCompositionLocal);
  document.getElementById('import-json-input')?.addEventListener('change', importCompositionJson);
}

export function loadCompositionLocal() {
  let index;
  try {
    index = readLocalIndex();
  } catch (error) {
    console.error('[Effect Editor] local save index unavailable', error);
    toast('Local save list could not be read. Existing saves were not changed.', 'warn');
    return;
  }
  if (!index.length) {
    toast('No local effects saved yet.', 'info');
    return;
  }
  const menu = index.map((item, i) => {
    const tags = Array.isArray(item.tags) && item.tags.length ? ` [${item.tags.join(', ')}]` : '';
    return `${i + 1}. ${item.name}${tags}`;
  }).join('\n');
  const answer = window.prompt(`Load local effect:\n${menu}\n\nEnter number:`, '1');
  if (!answer) return;
  const selected = index[Number(answer) - 1];
  if (!selected) {
    toast('No local effect matched that number.', 'warn');
    return;
  }
  try {
    const entry = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}${selected.id}`) || '{}');
    if (!entry.composition) throw new Error('Missing composition');
    loadComposition(entry.composition);
    clearParticles();
    closeMenus();
    toast(`Loaded local effect: ${selected.name}`, 'success');
  } catch (error) {
    console.error('[Effect Editor] local load failed', error);
    toast('Local effect could not be loaded.', 'warn');
  }
}

function saveCompositionLocal() {
  const answer = window.prompt('Save effect as:', editorState.composition.name || editorState.composition.id || 'Untitled Effect');
  if (!answer) return;

  const name = String(answer).trim() || 'Untitled Effect';
  const tags = Array.isArray(editorState.composition.tags) ? [...editorState.composition.tags] : [];
  const savedAt = new Date().toISOString();
  try {
    const index = readLocalIndex();
    const id = createLocalSaveId(index);
    const key = `${STORAGE_PREFIX}${id}`;
    const entry = { id, name, tags, savedAt, composition: { ...editorState.composition, name, tags } };
    const newIndex = [{ id, name, tags, savedAt }, ...index];
    const retainedIndex = newIndex.slice(0, MAX_LOCAL_SAVES);

    // Write the record first. If the index cannot be updated, undo only this
    // new record so all previous indexed saves remain available.
    localStorage.setItem(key, JSON.stringify(entry));
    try {
      localStorage.setItem(STORAGE_INDEX, JSON.stringify(retainedIndex));
    } catch (error) {
      try { localStorage.removeItem(key); }
      catch (rollbackError) { console.warn('[Effect Editor] could not roll back unfinished local save', rollbackError); }
      throw error;
    }

    // Prune only the entries explicitly evicted from the previous index.
    // Historical unindexed records may still be recoverable; leave them intact.
    const retainedIds = new Set(retainedIndex.map((item) => item.id));
    const prunedIds = [...new Set(index.map((item) => item.id).filter((id) => !retainedIds.has(id)))];
    let cleanupFailed = false;
    for (const oldId of prunedIds) {
      try { localStorage.removeItem(`${STORAGE_PREFIX}${oldId}`); }
      catch (error) {
        cleanupFailed = true;
        console.warn('[Effect Editor] could not remove an expired local save', error);
      }
    }
    closeMenus();
    toast(cleanupFailed
      ? `Saved locally: ${name}. Some older save data could not be cleaned up.`
      : `Saved locally: ${name}`, cleanupFailed ? 'warn' : 'success');
  } catch (error) {
    console.error('[Effect Editor] local save failed', error);
    toast('Could not save locally. Browser storage may be full or unavailable; export the composition as JSON for a backup.', 'warn');
  }
}

function createLocalSaveId(index) {
  // Timestamp-only IDs in earlier versions could collide on rapid saves.
  for (let attempt = 0; attempt < 10; attempt++) {
    const id = `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
    if (!index.some((item) => item.id === id) && localStorage.getItem(`${STORAGE_PREFIX}${id}`) === null) return id;
  }
  throw new Error('Unable to allocate a unique local save ID.');
}

function exportCompositionJson() {
  const blob = new Blob([JSON.stringify(editorState.composition, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeName(editorState.composition.name || editorState.composition.id || 'artifex-effect')}.json`;
  link.click();
  URL.revokeObjectURL(url);
  closeMenus();
  toast('Composition JSON exported.', 'success');
}

function importCompositionJson(event) {
  const file = event.target?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    try {
      loadComposition(JSON.parse(String(reader.result || '{}')));
      clearParticles();
      closeMenus();
      toast('Composition JSON imported.', 'success');
    } catch (error) {
      console.error('[Effect Editor] import failed', error);
      toast('Import failed. Check the JSON file.', 'warn');
    }
    event.target.value = '';
  });
  reader.readAsText(file);
}

function readLocalIndex() {
  // Never overwrite an unreadable index as though it were an empty list.
  const raw = localStorage.getItem(STORAGE_INDEX);
  if (raw === null) return [];
  const data = JSON.parse(raw);
  if (!Array.isArray(data) || !data.every((item) => (
    item && typeof item.id === 'string' && /^local_[a-z0-9_-]+$/u.test(item.id) && typeof item.name === 'string'
  ))) throw new Error('Local effect index is invalid.');
  return data;
}

function closeMenus() { document.querySelectorAll('.menu-panel.open').forEach((panel) => panel.classList.remove('open')); }
function bind(id, action) { document.getElementById(id)?.addEventListener('click', action); }
function safeName(value) { return String(value).replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '') || 'artifex-effect'; }
