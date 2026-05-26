import { addAssignment } from './module-state.js';
import { initRenderer } from './module-renderer.js';
import { initUI, showToast } from './module-ui.js';
import { cloneTemplateAssignment } from './module-library.js';
import { MODULE_VERSION } from './module-config.js';

window.addEventListener('artifex:toast', (event) => {
  showToast(event.detail.message, event.detail.type);
});

window.addEventListener('DOMContentLoaded', () => {
  initRenderer();
  initUI();

  const starter = cloneTemplateAssignment('template_scene_assignment');
  if (starter) addAssignment(starter);

  showToast(`Creation Guide ${MODULE_VERSION} loaded.`, 'success');
});
