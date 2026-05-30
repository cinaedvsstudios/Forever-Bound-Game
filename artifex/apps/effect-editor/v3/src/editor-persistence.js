import { clearParticles, editorState, loadComposition } from './editor-state.js';

const STORAGE_PREFIX = 'artifex-index2-effect:';
const STORAGE_INDEX = 'artifex-index2-effect-index';
let toast = () => {};

export function initEditorPersistence(showToast = () => {}) {
  toast = typeof showToast === 'function' ? showToast : () => {};
  bind('export-json-button', exportCompositionJson);
  bind('save-local-button', saveCompositionLocal);
  bind('load-local-button', loadCompositionLocal);
  document.getElementById('import-json-input')?.addEventListener('change', importCompositionJson);
}

export function loadCompositionLocal() {
  const index = readLocalIndex();
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
  const id = `local_${Date.now().toString(36)}`;
  const name = String(answer).trim() || 'Untitled Effect';
  const tags = Array.isArray(editorState.composition.tags) ? [...editorState.composition.tags] : [];
  const savedAt = new Date().toISOString();
  const entry = { id, name, tags, savedAt, composition: { ...editorState.composition, name, tags } };
  const index = readLocalIndex();
  index.unshift({ id, name, tags, savedAt });
  localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(entry));
  localStorage.setItem(STORAGE_INDEX, JSON.stringify(index.slice(0, 25)));
  closeMenus();
  toast(`Saved locally: ${name}`, 'success');
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
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_INDEX) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
function closeMenus() { document.querySelectorAll('.menu-panel.open').forEach((panel) => panel.classList.remove('open')); }
function bind(id, action) { document.getElementById(id)?.addEventListener('click', action); }
function safeName(value) { return String(value).replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '') || 'artifex-effect'; }
