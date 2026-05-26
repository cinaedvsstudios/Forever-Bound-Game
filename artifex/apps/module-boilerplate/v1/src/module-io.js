import { MODULE_LABEL, MODULE_SLUG, MODULE_STORAGE_KEY } from './module-config.js';
import { loadDocument, moduleState, serializeDocument } from './module-state.js';

export function exportJson() {
  const blob = new Blob([serializeDocument()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = sanitizeFilename(moduleState.document.name || MODULE_SLUG);
  link.href = url;
  link.download = `${safeName}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function importJsonFile(file) {
  if (!file) return;
  const text = await file.text();
  const parsed = JSON.parse(text);
  loadDocument(parsed);
}

export function saveLocal() {
  const saves = readLocalSaves();
  const id = moduleState.document.id;
  saves[id] = {
    savedAt: new Date().toISOString(),
    name: moduleState.document.name,
    data: moduleState.document
  };
  localStorage.setItem(MODULE_STORAGE_KEY, JSON.stringify(saves));
  return id;
}

export function readLocalSaves() {
  try {
    const parsed = JSON.parse(localStorage.getItem(MODULE_STORAGE_KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function loadLocalSave(id) {
  const saves = readLocalSaves();
  const save = saves[id];
  if (!save?.data) return false;
  loadDocument(save.data);
  return true;
}

export function deleteLocalSave(id) {
  const saves = readLocalSaves();
  if (!saves[id]) return false;
  delete saves[id];
  localStorage.setItem(MODULE_STORAGE_KEY, JSON.stringify(saves));
  return true;
}

export function formatLocalSavesForDisplay() {
  const saves = readLocalSaves();
  const entries = Object.entries(saves);

  if (!entries.length) return `No local ${MODULE_LABEL} saves found.`;

  return entries
    .map(([id, save], index) => `${index + 1}. ${save.name || id}\n   id: ${id}\n   saved: ${save.savedAt || 'unknown'}`)
    .join('\n\n');
}

function sanitizeFilename(name) {
  return String(name || MODULE_SLUG)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '') || MODULE_SLUG;
}
