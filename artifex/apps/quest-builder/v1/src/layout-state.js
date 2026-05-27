export const DEFAULT_LAYOUT = {
  leftW: 330,
  flowX: 380,
  flowY: 92,
  flowW: 860,
  flowH: 116,
  flowVertical: false,
  flowCollapsed: false,
  zoom: 1,
  panX: 0,
  panY: 0,
  panMode: false
};

export function createLayoutState(storageKey) {
  let current = { ...DEFAULT_LAYOUT };

  function load() {
    try {
      current = { ...DEFAULT_LAYOUT, ...JSON.parse(localStorage.getItem(storageKey) || '{}') };
    } catch {
      current = { ...DEFAULT_LAYOUT };
    }
    return current;
  }

  function get() {
    return current;
  }

  function patch(next) {
    current = { ...current, ...next };
    return current;
  }

  function save() {
    localStorage.setItem(storageKey, JSON.stringify(current));
  }

  function reset() {
    current = { ...DEFAULT_LAYOUT };
    save();
    return current;
  }

  return { load, get, patch, save, reset };
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
