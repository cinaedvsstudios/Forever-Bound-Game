import { addLayer } from './editor-state.js';
import { initRenderer } from './editor-renderer.js';
import { initUI, showToast } from './editor-ui.js';
import { initLibrary } from './editor-library.js';
import { cloneBasePreset } from './presets/base-effects.js';

window.addEventListener('artifex:toast', (event) => {
  showToast(event.detail.message, event.detail.type);
});

window.addEventListener('DOMContentLoaded', () => {
  initRenderer();
  initUI();
  initLibrary();

  const preset = cloneBasePreset('base', 'standard-particle');
  if (preset) {
    addLayer(preset.config);
  }

  showToast('Modular test editor loaded. Insert menu and renderer are active.', 'success');
});
