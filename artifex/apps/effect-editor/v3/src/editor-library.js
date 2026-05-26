import { addLayer, addLayers, loadComposition } from './editor-state.js';
import { listBasePresets } from './presets/base-effects.js';
import { COMPOSITES_REGISTRY, cloneCompositePreset } from './presets/composite-effects.js';
import { showToast } from './editor-ui.js';

export function initLibrary() {
  populateBaseLayerMenu();
  ensureLibraryToolbar();
  populateCompositeLibrary();

  document.getElementById('open-library-button').addEventListener('click', () => {
    populateCompositeLibrary();
    document.getElementById('library-dialog').showModal();
  });
}

function closeOpenMenus() {
  document.querySelectorAll('.menu-panel.open').forEach((panel) => panel.classList.remove('open'));
}

function populateBaseLayerMenu() {
  const list = document.getElementById('base-layer-list');
  list.innerHTML = '';

  for (const preset of listBasePresets()) {
    const button = document.createElement('button');
    button.textContent = preset.label;
    button.title = preset.description;
    button.addEventListener('click', () => {
      addLayer(preset.config);
      closeOpenMenus();
      showToast(`${preset.label} inserted.`, 'success');
    });
    list.append(button);
  }
}

function ensureLibraryToolbar() {
  const list = document.getElementById('composite-list');
  if (!list || document.getElementById('library-search-input')) return;
  list.insertAdjacentHTML('beforebegin', `
    <style>
      .library-toolbar { display: grid; grid-template-columns: 1fr auto; gap: 8px; margin-top: 12px; }
      .library-toolbar input { min-width: 0; }
      .library-card-actions { display: flex; flex-wrap: wrap; gap: 7px; }
      .library-card-actions button { min-height: 30px; padding: 6px 9px; font-size: 11px; }
    </style>
    <div class="library-toolbar">
      <input id="library-search-input" type="search" placeholder="Search archetypes" />
      <button id="library-clear-search" type="button">Clear</button>
    </div>
  `);
  document.getElementById('library-search-input')?.addEventListener('input', populateCompositeLibrary);
  document.getElementById('library-clear-search')?.addEventListener('click', () => {
    document.getElementById('library-search-input').value = '';
    populateCompositeLibrary();
  });
}

function populateCompositeLibrary() {
  const list = document.getElementById('composite-list');
  if (!list) return;
  const query = String(document.getElementById('library-search-input')?.value || '').trim().toLowerCase();
  const rows = COMPOSITES_REGISTRY.filter((composite) => {
    const haystack = `${composite.id} ${composite.label} ${composite.description}`.toLowerCase();
    return !query || haystack.includes(query);
  });
  list.innerHTML = '';

  if (!rows.length) {
    list.innerHTML = '<article class="library-card"><h3>No matches</h3><p>Try a different search term.</p></article>';
    return;
  }

  for (const composite of rows) {
    const card = document.createElement('article');
    card.className = 'library-card';
    card.innerHTML = `
      <h3>${escapeHtml(composite.label)}</h3>
      <p>${escapeHtml(composite.description)}</p>
      <div class="library-card-actions">
        <button type="button" data-action="append">Add Layers</button>
        <button type="button" data-action="replace">Replace Composition</button>
      </div>
    `;
    card.querySelector('[data-action="append"]').addEventListener('click', () => {
      const cloned = cloneCompositePreset(composite.id);
      if (!cloned) return;
      addLayers(cloned.layers);
      document.getElementById('library-dialog').close();
      showToast(`${composite.label} layers added.`, 'success');
    });
    card.querySelector('[data-action="replace"]').addEventListener('click', () => {
      loadCompositeAsComposition(composite.id);
      document.getElementById('library-dialog').close();
      showToast(`${composite.label} loaded as composition.`, 'success');
    });
    list.append(card);
  }
}

export function loadCompositeAsComposition(id) {
  const composite = cloneCompositePreset(id);
  if (!composite) return;
  loadComposition({
    id: composite.id,
    name: composite.label,
    layers: composite.layers
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}
