(() => {
  'use strict';

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

  function item(label, action, disabled = false) {
    return `<button type="button" class="editor-menu-item-v25" data-menu-action-v25="${action}" ${disabled ? 'disabled' : ''}>${label}</button>`;
  }

  function menu(label, action, body, primary = false) {
    return `<div class="editor-menu-v25 ${primary ? 'is-primary' : ''}" data-menu-v25="${action}"><button type="button" class="editor-menu-button-v25" data-open-menu-v25="${action}">${label} ▾</button><div class="editor-menu-dropdown-v25">${body}</div></div>`;
  }

  function markup() {
    return `<nav class="editor-menubar-v25" aria-label="Scene editor menu">
      ${menu('File', 'file', `${item('New Blank Scene', 'newBlank')}${item('New from Template', 'newTemplate')}${item('Download JSON', 'download')}${item('Settings', 'settings')}`)}
      ${menu('Edit', 'edit', `${item('Undo', 'placeholder', true)}${item('Redo', 'placeholder', true)}${item('Duplicate Selected', 'duplicate')}`)}
      ${menu('View', 'view', `${item('Toggle Guides', 'toggleGuides')}${item('Reset Zoom', 'resetZoom')}${item('Preview Selected', 'preview')}`)}
      ${menu('Effects', 'effects', `${item('Visual Adjustments', 'placeholder', true)}${item('Glow Colour', 'placeholder', true)}`, true)}
      ${menu('Help', 'help', `${item('Help', 'help')}${item('Shortcuts', 'placeholder', true)}`)}
    </nav>`;
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

  function install() {
    const bar = document.querySelector('.top-bar');
    if (!bar || bar.querySelector('.editor-menubar-v25')) return;
    bar.classList.add('has-menubar-v25');
    const divider = bar.querySelector('.title-divider') || bar.querySelector('.brand');
    const wrap = document.createElement('div');
    wrap.innerHTML = markup();
    const nav = wrap.firstElementChild;
    if (divider?.nextSibling) bar.insertBefore(nav, divider.nextSibling);
    else bar.appendChild(nav);
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

  window.addEventListener('load', install);
  document.addEventListener('click', () => requestAnimationFrame(install), true);
  document.addEventListener('input', () => requestAnimationFrame(install), true);
  setInterval(install, 800);
  install();
})();
