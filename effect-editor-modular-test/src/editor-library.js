import { addLayer, addLayers, loadComposition } from './editor-state.js';
import { listBasePresets } from './presets/base-effects.js';
import { COMPOSITES_REGISTRY, cloneCompositePreset } from './presets/composite-effects.js';
import { showToast } from './editor-ui.js';

export function initLibrary() {
  populateBaseLayerMenu();
  populateCompositeLibrary();

  document.getElementById('open-library-button').addEventListener('click', () => {
    document.getElementById('library-dialog').showModal();
  });
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
      showToast(`${preset.label} inserted.`, 'success');
    });
    list.append(button);
  }
}

function populateCompositeLibrary() {
  const list = document.getElementById('composite-list');
  list.innerHTML = '';

  for (const composite of COMPOSITES_REGISTRY) {
    const card = document.createElement('article');
    card.className = 'library-card';
    card.innerHTML = `
      <h3>${escapeHtml(composite.label)}</h3>
      <p>${escapeHtml(composite.description)}</p>
      <button type="button">Load archetype</button>
    `;
    card.querySelector('button').addEventListener('click', () => {
      const cloned = cloneCompositePreset(composite.id);
      if (!cloned) return;
      addLayers(cloned.layers);
      document.getElementById('library-dialog').close();
      showToast(`${composite.label} loaded.`, 'success');
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
