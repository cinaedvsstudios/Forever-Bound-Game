import { subscribe, getState } from './core/store.js';
import { setupAssetImport, renderAssets } from './ui/assets.js';
import { setupStage, renderStage } from './ui/stage.js';
import { setupPanels, renderPanels } from './ui/panels.js';
import { setupToolbar } from './ui/toolbar.js';
import { setupMenubar } from './ui/menubar.js';
import { setupViewport, renderViewport } from './ui/viewport.js';
import { dom } from './ui/dom.js';

function render() {
  const state = getState();
  dom.sceneTitle.textContent = state.title;
  dom.canvasReadout.textContent = `${state.canvas.width} × ${state.canvas.height} · ${Math.round((state.viewport?.zoom ?? 1) * 100)}%`;
  document.querySelectorAll('[data-tool]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.tool === state.activeTool);
  });
  document.querySelectorAll('[data-view-toggle]').forEach((button) => {
    const enabled = button.dataset.viewToggle === 'grid' ? state.showGrid : state.showGuides;
    button.setAttribute('aria-checked', String(enabled));
  });
  renderAssets();
  renderViewport();
  renderStage();
  renderPanels();
}

setupAssetImport();
setupStage();
setupPanels();
setupMenubar();
setupViewport();
setupToolbar();
subscribe(render);
render();
