// Artifex Project Manager UI helpers
// Shared by focused Project Manager UI modules.

export const UI_STORAGE_KEYS = Object.freeze({
  splitStatePreviewVisible: 'artifex_project_split_state_preview_visible',
  inspectorPosition: 'artifex_project_inspector_position',
  assetBrowserMode: 'artifex_project_asset_browser_mode'
});

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function getById(id) {
  return document.getElementById(id);
}

export function readBooleanPreference(key, fallback = false) {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (raw === 'true') return true;
    if (raw === 'false') return false;
  } catch (error) {
    console.warn(`[ProjectUI] Could not read UI preference ${key}`, error);
  }
  return fallback;
}

export function writeBooleanPreference(key, value) {
  try {
    globalThis.localStorage?.setItem(key, String(Boolean(value)));
  } catch (error) {
    console.warn(`[ProjectUI] Could not write UI preference ${key}`, error);
  }
}

export function readJSONPreference(key, fallback) {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`[ProjectUI] Could not read JSON preference ${key}`, error);
    return fallback;
  }
}

export function writeJSONPreference(key, value) {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[ProjectUI] Could not write JSON preference ${key}`, error);
  }
}
