// Artifex Project Manager menu UI
// Owns dropdown behaviour and menu-to-workspace routing.

export function getProjectStorageItem(key, fallback = '') {
  try {
    return globalThis.localStorage?.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

export function setProjectStorageItem(key, value) {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    // non-fatal
  }
}

export function closeProjectMenus() {
  document.querySelectorAll('.project-menu details[open]').forEach((menu) => menu.removeAttribute('open'));
}

export function wireProjectMenuBehaviourOnce() {
  if (window.__artifexProjectMenuWired) return;
  window.__artifexProjectMenuWired = true;

  document.addEventListener('toggle', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLDetailsElement)) return;
    if (!target.matches('[data-project-menu]')) return;
    if (!target.open) return;

    document.querySelectorAll('[data-project-menu][open]').forEach((menu) => {
      if (menu !== target) menu.removeAttribute('open');
    });
  }, true);

  document.addEventListener('pointerdown', (event) => {
    if (event.target?.closest?.('.project-menu')) return;
    closeProjectMenus();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeProjectMenus();
  });
}

export function wireLibraryMenuTargets({ ui, storageKey }) {
  document.querySelectorAll('[data-library-target]').forEach((button) => {
    button.onclick = () => {
      setProjectStorageItem(storageKey, button.dataset.libraryTarget || 'assets');
      ui.setWorkspace?.('assetbrowser');
      closeProjectMenus();
    };
  });
}
