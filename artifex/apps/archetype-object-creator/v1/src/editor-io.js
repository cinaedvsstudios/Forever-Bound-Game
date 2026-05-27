import { STORAGE_PREFIX, editorState, loadArchetype, serializeArchetype, objectExportTarget } from './editor-state.js';

export function downloadCurrentArchetype() {
  const json = serializeArchetype();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const id = editorState.archetype.id || 'archobj_object_archetype';
  link.href = url;
  link.download = `${id}.json`;
  link.title = `Exports for ${objectExportTarget(id)}. Add/update this file in archetypes/object-index.json.`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function importArchetypeFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        loadArchetype(parsed);
        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error || new Error('Unable to read file.'));
    reader.readAsText(file);
  });
}

export function saveCurrentLocal() {
  const key = `${STORAGE_PREFIX}${editorState.archetype.id}`;
  localStorage.setItem(key, serializeArchetype());
  return key;
}

export function listLocalArchetypes() {
  const items = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || !key.startsWith(STORAGE_PREFIX)) continue;
    try {
      const data = JSON.parse(localStorage.getItem(key));
      items.push({ key, data });
    } catch {
      items.push({ key, data: { id: key.replace(STORAGE_PREFIX, ''), name: 'Unreadable local archetype' } });
    }
  }
  return items.sort((a, b) => String(a.data.name).localeCompare(String(b.data.name)));
}

export function loadLocalArchetype(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return false;
  loadArchetype(JSON.parse(raw));
  return true;
}

export function deleteLocalArchetype(key) {
  localStorage.removeItem(key);
}

export function captureCanvasSnapshot(canvas) {
  const link = document.createElement('a');
  link.download = `${editorState.archetype.id || 'archobj_object_archetype'}_preview.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  link.remove();
}
