import { addRecord } from './module-state.js';
import { initRenderer } from './module-renderer.js';
import { initUI, showToast } from './module-ui.js';
import { cloneTemplateRecord } from './module-library.js';
import { MODULE_VERSION } from './module-config.js';

window.addEventListener('artifex:toast', (event) => {
  showToast(event.detail.message, event.detail.type);
});

window.addEventListener('DOMContentLoaded', () => {
  initRenderer();
  initUI();

  const starter = cloneTemplateRecord('template_generic');
  if (starter) addRecord(starter);

  showToast(`${MODULE_VERSION} loaded.`, 'success');
});
