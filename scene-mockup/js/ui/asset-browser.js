const browserState = {
  category: 'all',
  layout: 'grid',
  isOpen: false,
  isMinimised: false,
  libraryView: 'assets',
  onChange: () => {},
  onRefresh: () => {},
  onImport: () => {},
  onAddPlaceholder: () => {}
};

const elements = {};

export function mountAssetBrowser({ onChange, onRefresh, onImport, onAddPlaceholder }) {
  browserState.onChange = onChange;
  browserState.onRefresh = onRefresh;
  browserState.onImport = onImport;
  browserState.onAddPlaceholder = onAddPlaceholder;
  ensureStylesheet();

  if (!document.querySelector('#scene-mockup-asset-browser-controls')) {
    removeLegacyLibraryChrome();
    insertBrowserControls();
    insertFloatingBrowser();
    wireControls();
  }

  syncAssetBrowser({ visibleCount: 0, libraryView: browserState.libraryView });
}

export function getAssetBrowserState() {
  return { ...browserState };
}

export function setAssetLibraryView(libraryView) {
  browserState.libraryView = libraryView;
  if (libraryView === 'scene') browserState.category = 'all';
  browserState.onChange();
}

export function getAssetGridTargets() {
  const targets = [];
  if (browserState.libraryView !== 'settings') {
    targets.push(document.querySelector('#asset-grid'));
  }
  if (browserState.isOpen && !browserState.isMinimised) {
    targets.push(elements.floatingGrid);
  }
  return targets.filter(Boolean);
}

export function syncAssetBrowser({ visibleCount, libraryView }) {
  browserState.libraryView = libraryView;
  const settingsOpen = libraryView === 'settings';

  document.querySelectorAll('[data-sm-category]').forEach((button) => {
    const isCurrent = button.dataset.smCategory === browserState.category;
    button.classList.toggle('is-active', isCurrent);
    button.disabled = libraryView === 'scene' && button.dataset.smCategory !== 'all';
  });
  document.querySelectorAll('[data-sm-layout]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.smLayout === browserState.layout);
  });

  if (elements.assetBrowserControls) elements.assetBrowserControls.classList.toggle('is-settings-open', settingsOpen);
  if (elements.assetLibraryMain) elements.assetLibraryMain.hidden = settingsOpen;
  if (elements.assetSettings) elements.assetSettings.hidden = !settingsOpen;
  document.querySelector('#asset-grid')?.toggleAttribute('hidden', settingsOpen);

  getAssetGridTargets().forEach((grid) => { grid.dataset.layout = browserState.layout; });

  if (elements.floatingWindow) {
    elements.floatingWindow.classList.toggle('is-minimised', browserState.isMinimised);
    elements.minimiseButton.textContent = browserState.isMinimised ? '□' : '−';
    elements.minimiseButton.title = browserState.isMinimised ? 'Restore asset browser' : 'Minimise asset browser';
  }

  if (elements.summary) {
    const noun = libraryView === 'scene' ? 'scene layer' : 'asset';
    elements.summary.textContent = `${visibleCount} ${noun}${visibleCount === 1 ? '' : 's'} shown`;
  }
}

function ensureStylesheet() {
  if (document.querySelector('link[href="./css/asset-browser.css"]')) return;
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = './css/asset-browser.css';
  document.head.append(stylesheet);
}

function removeLegacyLibraryChrome() {
  document.querySelector('.asset-panel > .panel-heading')?.remove();
  document.querySelector('#asset-drop-zone')?.remove();
}

function insertBrowserControls() {
  const toolbar = document.querySelector('.asset-toolbar');
  toolbar.insertAdjacentHTML('beforeend', '<button class="library-tab" type="button" data-library-view="settings">Settings</button>');
  toolbar.insertAdjacentHTML('afterend', `
    <section class="asset-browser-controls" id="scene-mockup-asset-browser-controls" aria-label="Asset browser controls">
      <div class="asset-library-main" id="sm-asset-library-main">
        <div class="asset-search-row">
          <label class="asset-search-control" for="sm-asset-search">
            <span class="visually-hidden">Search assets</span>
            <input id="sm-asset-search" type="search" placeholder="Search assets…" autocomplete="off" />
          </label>
          <button class="icon-button compact" id="sm-clear-search" type="button" title="Clear asset search" aria-label="Clear asset search">×</button>
          <div class="library-view-actions" aria-label="Asset view">
            <button class="view-mode-button is-active" type="button" data-sm-layout="grid" title="Small thumbnail gallery" aria-label="Small thumbnail gallery">▦</button>
            <button class="view-mode-button" type="button" data-sm-layout="large" title="Large vertical previews" aria-label="Large vertical previews">▤</button>
          </div>
        </div>
        <div class="asset-category-bar" aria-label="Asset folders">
          <button class="asset-category-chip is-active" type="button" data-sm-category="all">All</button>
          <button class="asset-category-chip" type="button" data-sm-category="backgrounds">Backgrounds</button>
          <button class="asset-category-chip" type="button" data-sm-category="people">People</button>
          <button class="asset-category-chip" type="button" data-sm-category="objects">Objects</button>
          <button class="asset-category-chip" type="button" data-sm-category="imports">Imported</button>
        </div>
      </div>

      <section class="asset-settings-panel" id="sm-asset-settings" hidden>
        <div class="asset-settings-copy">
          <p class="eyebrow">ASSET LOCATION</p>
          <p>Repository folders are scanned when Scene Mockup opens or when the library is refreshed.</p>
        </div>
        <div class="asset-source-note">
          <span class="source-indicator" aria-hidden="true"></span>
          <span><strong>assets/backgrounds</strong><br /><strong>assets/people</strong><br /><strong>assets/objects</strong></span>
        </div>
        <div class="asset-settings-actions">
          <button class="soft-button" id="sm-import-assets" type="button">Choose files</button>
          <button class="soft-button" id="sm-add-placeholder" type="button">Add placeholder</button>
          <button class="soft-button" id="sm-refresh-assets" type="button">Refresh library</button>
          <button class="soft-button" id="sm-open-asset-browser" type="button">Pop out browser</button>
        </div>
        <p class="asset-settings-hint">Drop PNG, JPG, WEBP or GLB files anywhere in this left panel to import them.</p>
      </section>
    </section>
  `);

  elements.assetBrowserControls = document.querySelector('#scene-mockup-asset-browser-controls');
  elements.assetLibraryMain = document.querySelector('#sm-asset-library-main');
  elements.assetSettings = document.querySelector('#sm-asset-settings');
  elements.search = document.querySelector('#sm-asset-search');
  elements.clearSearch = document.querySelector('#sm-clear-search');
  elements.refresh = document.querySelector('#sm-refresh-assets');
  elements.open = document.querySelector('#sm-open-asset-browser');
  elements.import = document.querySelector('#sm-import-assets');
  elements.addPlaceholder = document.querySelector('#sm-add-placeholder');
}

function insertFloatingBrowser() {
  document.body.insertAdjacentHTML('beforeend', `
    <section class="asset-browser-window" id="sm-floating-asset-browser" aria-label="Floating asset browser" hidden>
      <header class="asset-browser-window-header" id="sm-asset-browser-drag-handle">
        <div class="asset-browser-window-title">
          <span class="asset-browser-window-mark" aria-hidden="true">◫</span>
          <div><p class="eyebrow">FLOATING LIBRARY</p><strong>Asset Browser</strong></div>
        </div>
        <div class="asset-browser-window-actions">
          <button class="icon-button compact" id="sm-minimise-asset-browser" type="button" title="Minimise asset browser" aria-label="Minimise asset browser">−</button>
          <button class="icon-button compact" id="sm-close-asset-browser" type="button" title="Close asset browser" aria-label="Close asset browser">×</button>
        </div>
      </header>
      <div class="asset-browser-window-body">
        <div class="asset-browser-summary">
          <span id="sm-floating-asset-summary">Repository assets</span>
          <span class="asset-browser-hint">Drag the header · resize from the lower-right corner</span>
        </div>
        <div class="floating-asset-grid asset-grid" id="sm-floating-asset-grid" data-layout="grid" aria-live="polite"></div>
      </div>
    </section>
  `);

  elements.floatingWindow = document.querySelector('#sm-floating-asset-browser');
  elements.floatingGrid = document.querySelector('#sm-floating-asset-grid');
  elements.summary = document.querySelector('#sm-floating-asset-summary');
  elements.dragHandle = document.querySelector('#sm-asset-browser-drag-handle');
  elements.minimiseButton = document.querySelector('#sm-minimise-asset-browser');
  elements.closeButton = document.querySelector('#sm-close-asset-browser');
}

function wireControls() {
  document.querySelectorAll('[data-sm-category]').forEach((button) => {
    button.addEventListener('click', () => {
      browserState.category = button.dataset.smCategory;
      browserState.onChange();
    });
  });

  document.querySelectorAll('[data-sm-layout]').forEach((button) => {
    button.addEventListener('click', () => {
      browserState.layout = button.dataset.smLayout;
      browserState.onChange();
    });
  });

  elements.search.addEventListener('input', () => browserState.onChange());
  elements.clearSearch.addEventListener('click', () => {
    elements.search.value = '';
    elements.search.focus();
    browserState.onChange();
  });

  elements.import.addEventListener('click', () => browserState.onImport());
  elements.addPlaceholder.addEventListener('click', () => browserState.onAddPlaceholder());

  elements.refresh.addEventListener('click', async () => {
    elements.refresh.classList.add('is-loading');
    try {
      await browserState.onRefresh();
    } finally {
      elements.refresh.classList.remove('is-loading');
    }
  });

  elements.open.addEventListener('click', () => {
    browserState.isOpen = true;
    browserState.isMinimised = false;
    elements.floatingWindow.hidden = false;
    browserState.onChange();
  });

  elements.closeButton.addEventListener('click', () => {
    browserState.isOpen = false;
    elements.floatingWindow.hidden = true;
    browserState.onChange();
  });

  elements.minimiseButton.addEventListener('click', () => {
    browserState.isMinimised = !browserState.isMinimised;
    browserState.onChange();
  });

  setupWindowDragging();
}

function setupWindowDragging() {
  let drag = null;

  elements.dragHandle.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button')) return;
    const bounds = elements.floatingWindow.getBoundingClientRect();
    drag = {
      pointerId: event.pointerId,
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top
    };
    elements.dragHandle.setPointerCapture(event.pointerId);
    elements.floatingWindow.classList.add('is-dragging');
  });

  elements.dragHandle.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const maxX = Math.max(12, window.innerWidth - elements.floatingWindow.offsetWidth - 12);
    const maxY = Math.max(12, window.innerHeight - elements.floatingWindow.offsetHeight - 12);
    const left = Math.min(maxX, Math.max(12, event.clientX - drag.x));
    const top = Math.min(maxY, Math.max(12, event.clientY - drag.y));
    elements.floatingWindow.style.left = `${left}px`;
    elements.floatingWindow.style.top = `${top}px`;
    elements.floatingWindow.style.right = 'auto';
  });

  const finish = (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (elements.dragHandle.hasPointerCapture(event.pointerId)) {
      elements.dragHandle.releasePointerCapture(event.pointerId);
    }
    drag = null;
    elements.floatingWindow.classList.remove('is-dragging');
  };

  elements.dragHandle.addEventListener('pointerup', finish);
  elements.dragHandle.addEventListener('pointercancel', finish);
}

export function getAssetSearchQuery() {
  return elements.search?.value.trim().toLocaleLowerCase() ?? '';
}
