(() => {
  'use strict';

  // Permanent Scene Editor menu controller, consolidated from v25 menu polish.
  // The existing v25 class/data names are intentionally preserved for CSS compatibility.

  let openMenu = null;

  function core() {
    return window.ArtifexSceneEditorCore || null;
  }

  function toast(message) {
    core()?.toast?.(message);
  }

  function trigger(selector) {
    const target = document.querySelector(selector);
    if (!target) {
      toast('Menu item is not available yet');
      return;
    }
    target.click();
  }

  function closeMenus() {
    document.querySelectorAll('.editor-menu-v25.is-open-v25').forEach((menu) => menu.classList.remove('is-open-v25'));
    openMenu = null;
  }

  function run(action) {
    closeMenus();
    if (action === 'newBlank') return trigger('#blankBtn');
    if (action === 'newTemplate') return trigger('#importTemplate');
    if (action === 'download') return trigger('#downloadJson');
    if (action === 'settings') return toast('Settings are currently in the editor controls/local settings. Dedicated settings window is coming back later.');
    if (action === 'duplicate') return document.querySelector('[data-action="duplicate"]')?.click() || toast('Right-click an object to duplicate it for now');
    if (action === 'toggleGuides') return trigger('#highlightBtn');
    if (action === 'resetZoom') return trigger('#zoomReset');
    if (action === 'preview') return trigger('.object-preview-btn-v24');
    if (action === 'help') return toast('Help menu placeholder. Tutorial/help window will be restored here.');
    toast('Menu placeholder');
  }

  document.addEventListener('click', (event) => {
    const opener = event.target.closest?.('[data-open-menu-v25]');
    if (opener) {
      event.preventDefault();
      event.stopPropagation();
      const menu = opener.closest('.editor-menu-v25');
      const alreadyOpen = menu.classList.contains('is-open-v25');
      closeMenus();
      if (!alreadyOpen) {
        menu.classList.add('is-open-v25');
        openMenu = menu;
      }
      return;
    }

    const action = event.target.closest?.('[data-menu-action-v25]')?.dataset.menuActionV25;
    if (action) {
      event.preventDefault();
      event.stopPropagation();
      run(action);
      return;
    }

    if (openMenu && !event.target.closest?.('.editor-menu-v25')) closeMenus();
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenus();
  }, true);

})();
