import { subscribe, getState } from './core/store.js';
import { setupAssetImport, renderAssets } from './ui/assets.js';
import { setupStage, renderStage } from './ui/stage.js';
import { setupPanels, renderPanels } from './ui/panels.js';
import { setupToolbar } from './ui/toolbar.js';
import { dom } from './ui/dom.js';

function render() {
  const state = getState();
  dom.sceneTitle.textContent = state.title;
  dom.canvasReadout.textContent = `${state.canvas.width} × ${state.canvas.height}`;
  dom.gridToggle.checked = state.showGrid;
  dom.guidesToggle.checked = state.showGuides;
  document.querySelectorAll('[data-tool]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.tool === state.activeTool);
  });
  renderAssets();
  renderStage();
  renderPanels();
}

setupAssetImport();
setupStage();
setupPanels();
setupToolbar();
subscribe(render);
render();
