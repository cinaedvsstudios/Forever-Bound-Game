import { editorState, loadComposition, serializeComposition } from './editor-state.js';

const STORAGE_PREFIX = 'artifex-effect-editor-modular-test';

export function exportJSON() {
  const blob = new Blob([serializeComposition()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${editorState.composition.id || 'artifex-effect'}.json`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

export async function importJSONFromFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    loadComposition(parsed);
    emitToast(`Imported ${file.name}.`, 'success');
  } catch (error) {
    emitToast(`Import failed: ${error.message}`, 'error');
  } finally {
    event.target.value = '';
  }
}

export function saveToLocalStorage() {
  const key = `${STORAGE_PREFIX}:${editorState.composition.id}`;
  localStorage.setItem(key, serializeComposition());
  emitToast('Saved to local storage.', 'success');
}

export function showLocalFiles() {
  const dialog = document.getElementById('local-dialog');
  const output = document.getElementById('local-files-output');
  const rows = [];

  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      rows.push(key.replace(`${STORAGE_PREFIX}:`, ''));
    }
  }

  output.textContent = rows.length
    ? rows.join('\n')
    : 'No local modular-test effects saved yet.';

  dialog.showModal();
}

function emitToast(message, type) {
  window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message, type } }));
}
