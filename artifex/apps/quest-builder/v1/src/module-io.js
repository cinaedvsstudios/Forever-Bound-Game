import { MODULE_SLUG, MODULE_STORAGE_KEY } from './module-config.js?v=qb-v1-0-1-20260526d';
import { loadDocument, serializeDocument, state } from './module-state.js?v=qb-v1-0-1-20260526d';

export function exportJson() {
  const blob = new Blob([serializeDocument()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(state.document.name || MODULE_SLUG)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function importJsonFile(file) {
  if (!file) return;
  const text = await file.text();
  loadDocument(JSON.parse(text));
}

export function saveLocal() {
  const saves = readLocalSaves();
  saves[state.document.id] = {
    savedAt: new Date().toISOString(),
    name: state.document.name,
    data: state.document
  };
  localStorage.setItem(MODULE_STORAGE_KEY, JSON.stringify(saves));
}

export function readLocalSaves() {
  try {
    const parsed = JSON.parse(localStorage.getItem(MODULE_STORAGE_KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function sanitizeFilename(name) {
  return String(name || MODULE_SLUG)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '') || MODULE_SLUG;
}
