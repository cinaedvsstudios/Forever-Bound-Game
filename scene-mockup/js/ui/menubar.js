let activeMenu = null;

export function setupMenubar() {
  document.querySelectorAll('[data-menu-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const menuName = trigger.dataset.menuTrigger;
      activeMenu === menuName ? closeMenus() : openMenu(menuName);
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('#app-menubar')) closeMenus();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenus();
  });
}

export function closeMenus() {
  activeMenu = null;
  document.querySelectorAll('[data-menu-trigger]').forEach((trigger) => {
    trigger.setAttribute('aria-expanded', 'false');
  });
  document.querySelectorAll('[data-menu-panel]').forEach((panel) => {
    panel.hidden = true;
  });
}

function openMenu(menuName) {
  activeMenu = menuName;
  document.querySelectorAll('[data-menu-trigger]').forEach((trigger) => {
    trigger.setAttribute('aria-expanded', String(trigger.dataset.menuTrigger === menuName));
  });
  document.querySelectorAll('[data-menu-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.menuPanel !== menuName;
  });
}
