const GROUPS = [
  {
    id: 'new-import',
    label: 'New / Import',
    icon: '🆕',
    selectors: ['#new-effect-button', '.menu-file-label']
  },
  {
    id: 'export',
    label: 'Export',
    icon: '📤',
    selectors: [
      '#export-json-button',
      buttonWithText('Export Editor Project JSON'),
      buttonWithText('Export Effect Archetype JSON'),
      buttonWithText('Export Scene FX Instance JSON')
    ]
  },
  {
    id: 'resolution',
    label: 'Scene Resolution',
    icon: '📐',
    selectors: ['.resolution-row', '.resolution-actions', '.resolution-note']
  }
];

const LOCAL_SELECTORS = [
  '#save-local-button',
  '#view-local-button',
  '#export-local-bundle-menu-button',
  '#emergency-backup-menu-button',
  buttonWithText('Settings')
];

export function initV320FileMenu() {
  injectStyles();
  buildSimpleFileMenu();
}

function injectStyles() {
  if (document.getElementById('v320-file-menu-style')) return;
  const style = document.createElement('style');
  style.id = 'v320-file-menu-style';
  style.textContent = `
    #menu-file.v320-file-menu {
      width: 270px;
      overflow: visible;
    }
    #menu-file.v320-file-menu .v320-file-group {
      position: relative;
      margin-bottom: 7px;
    }
    #menu-file.v320-file-menu .v320-file-group-button {
      width: 100%;
      min-height: 38px;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 10px;
    }
    #menu-file.v320-file-menu .v320-file-group-button span:first-child {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    #menu-file.v320-file-menu .v320-file-flyout {
      position: absolute;
      top: 0;
      left: calc(100% + 8px);
      z-index: 80;
      min-width: 300px;
      display: none;
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 16px;
      background: rgba(18, 12, 10, .98);
      box-shadow: 0 18px 34px rgba(0,0,0,.58), 0 0 18px rgba(0,174,234,.12);
    }
    #menu-file.v320-file-menu .v320-file-group:hover .v320-file-flyout,
    #menu-file.v320-file-menu .v320-file-group.is-open .v320-file-flyout {
      display: grid;
      gap: 8px;
    }
    #menu-file.v320-file-menu .v320-file-flyout .resolution-row,
    #menu-file.v320-file-menu .v320-file-flyout .resolution-actions {
      margin: 0;
    }
    #menu-file.v320-file-menu .v320-file-flyout .resolution-note {
      margin: 4px 2px 0;
    }
    #menu-file.v320-file-menu .v320-file-local {
      display: grid;
      gap: 7px;
      margin-top: 9px;
      padding-top: 10px;
      border-top: 1px solid rgba(226,204,167,.14);
    }
    #menu-file.v320-file-menu .v320-file-local-title {
      margin: 0 0 1px;
      color: var(--gold-muted);
      font-size: 10px;
      letter-spacing: .18em;
      text-transform: uppercase;
    }
    #menu-file.v320-file-menu .menu-divider,
    #menu-file.v320-file-menu .menu-section-title {
      display: none !important;
    }
  `;
  document.head.append(style);
}

function buildSimpleFileMenu() {
  const panel = document.getElementById('menu-file');
  if (!panel || panel.dataset.v320FileMenu === 'true') return;
  panel.dataset.v320FileMenu = 'true';
  panel.classList.add('v320-file-menu');

  const module = document.getElementById('module-switcher-section-v317');
  const local = document.createElement('section');
  local.className = 'v320-file-local';
  local.innerHTML = '<h3 class="v320-file-local-title">Local</h3>';

  const fragments = [];
  if (module) fragments.push(module);

  GROUPS.forEach((group) => {
    const elements = collectElements(group.selectors);
    if (!elements.length) return;
    const section = document.createElement('section');
    section.className = 'v320-file-group';
    section.id = `v320-file-group-${group.id}`;
    section.innerHTML = `<button class="v320-file-group-button" type="button"><span>${group.icon} ${group.label}</span><span>▸</span></button><div class="v320-file-flyout"></div>`;
    const flyout = section.querySelector('.v320-file-flyout');
    elements.forEach((element) => flyout.append(element));
    fragments.push(section);
  });

  collectElements(LOCAL_SELECTORS).forEach((element) => local.append(element));
  if (local.children.length > 1) fragments.push(local);

  Array.from(panel.children).forEach((child) => {
    if (child.classList?.contains('menu-divider') || child.classList?.contains('menu-section-title')) child.remove();
  });

  panel.prepend(...fragments);
  bindFlyoutClick(panel);
}

function collectElements(selectors) {
  const results = [];
  selectors.forEach((selector) => {
    const element = typeof selector === 'function' ? selector() : document.querySelector(selector);
    if (element && !results.includes(element)) results.push(element);
  });
  return results;
}

function buttonWithText(text) {
  return () => Array.from(document.querySelectorAll('#menu-file button')).find((button) => button.textContent.trim() === text);
}

function bindFlyoutClick(panel) {
  panel.addEventListener('click', (event) => {
    const button = event.target.closest?.('.v320-file-group-button');
    if (!button) return;
    const group = button.closest('.v320-file-group');
    if (!group) return;
    event.preventDefault();
    Array.from(panel.querySelectorAll('.v320-file-group.is-open')).forEach((open) => {
      if (open !== group) open.classList.remove('is-open');
    });
    group.classList.toggle('is-open');
  });

  document.addEventListener('click', (event) => {
    if (panel.contains(event.target)) return;
    panel.querySelectorAll('.v320-file-group.is-open, #module-switcher-section-v317.is-open').forEach((group) => group.classList.remove('is-open'));
  });
}
