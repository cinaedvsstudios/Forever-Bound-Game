let activeMenu = null;

export function setupMenubar() {
  insertAppsMenu();

  document.querySelectorAll('[data-menu-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const menuName = trigger.dataset.menuTrigger;
      activeMenu === menuName ? closeMenus() : openMenu(menuName);
    });
  });

  document.querySelectorAll('[data-app-link]').forEach((link) => {
    link.addEventListener('click', () => window.setTimeout(closeMenus, 0));
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

function insertAppsMenu() {
  if (document.querySelector('[data-menu-trigger="apps"]')) return;

  const toolsGroup = document.querySelector('[data-menu-trigger="tools"]')?.closest('.menu-group');
  if (!toolsGroup) return;

  toolsGroup.insertAdjacentHTML('afterend', `
    <div class="menu-group">
      <button class="menu-trigger" type="button" data-menu-trigger="apps" aria-haspopup="true" aria-expanded="false">📱 Apps</button>
      <div class="menu-panel" data-menu-panel="apps" role="menu" hidden>
        <a class="menu-link" role="menuitem" data-app-link href="https://cinaedvsstudios.github.io/forever-bound-wiki/modules/storyboarder/" target="_blank" rel="noopener noreferrer">🎬 Storyboarder <span>↗️</span></a>
        <a class="menu-link" role="menuitem" data-app-link href="https://cinaedvsstudios.github.io/forever-bound-wiki/" target="_blank" rel="noopener noreferrer">🔮 Forever Bound Wiki <span>↗️</span></a>
      </div>
    </div>
  `);
}
