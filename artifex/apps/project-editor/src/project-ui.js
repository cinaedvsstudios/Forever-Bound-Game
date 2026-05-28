import { escapeHtml, getById } from './project-ui-helpers.js?v=0.1.30-preview-fix';
import { renderProjectCatalog } from './project-sidebar-ui.js?v=0.1.30-preview-fix';
import { createProjectInspectorUI } from './project-inspector-ui.js?v=0.1.30-preview-fix';
import { createProjectJsonPreviewUI } from './project-json-preview-ui.js?v=0.1.30-preview-fix';

// Artifex Project Editor UI coordinator
// Base UI orchestration only. Focused rendering lives in smaller modules.

export function createProjectUI({
  stateManager,
  getTypeStyle,
  renderer,
  canvasController,
  onRefresh,
  renderStitcher,
  renderBuildPrep
}) {
  const refs = {
    sidebar: getById('sidebarAccordion'),
    canvas: getById('flatplanCanvas'),
    workspaceLabel: getById('activeWorkspaceName'),
    flatplanStage: getById('flatplanCanvas'),
    manifestStage: getById('manifestWorkspace'),
    stitcherStage: getById('stitcherWorkspace'),
    buildPrepStage: getById('buildPrepWorkspace'),
    assetBrowserStage: getById('assetBrowserWorkspace'),
    wizardStage: getById('wizardWorkspace')
  };

  const jsonPreview = createProjectJsonPreviewUI({
    stateManager,
    onRefresh
  });

  const inspector = createProjectInspectorUI({
    canvasElement: refs.canvas,
    stateManager,
    renderer,
    renderJsonPreview: () => jsonPreview.renderJsonPreview(),
    onRefresh
  });

  function renderCatalog() {
    renderProjectCatalog({
      sidebar: refs.sidebar,
      stateManager,
      getTypeStyle,
      onRefresh
    });
  }

  function renderJsonPreview() {
    jsonPreview.renderJsonPreview();
  }

  function renderInspectorPreview() {
    inspector.renderInspectorPreview();
  }

  function renderManifest() {
    if (!refs.manifestStage) return;
    refs.manifestStage.innerHTML = `
      <div class="h-full overflow-y-auto p-6">
        <div class="max-w-4xl mx-auto space-y-6">
          <div class="border-b border-[#2d2d42] pb-4">
            <h2 class="text-xl font-bold tracking-wide text-zinc-100">Project Manifest</h2>
            <p class="text-xs text-zinc-500">Global project setup, start screen, enabled modules, and project package references.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-cardDark border border-[#2d2d42] rounded-lg p-4 space-y-3">
              <h3 class="text-sm font-bold text-zinc-200 flex items-center gap-2"><i data-lucide="sliders" class="w-4 h-4 text-projectGoldGlow"></i> Metadata</h3>
              <div class="text-xs text-zinc-400 space-y-2 font-mono">
                <div>projectId: ${escapeHtml(stateManager.project.projectId)}</div>
                <div>title: ${escapeHtml(stateManager.project.gameTitle)}</div>
                <div>creator: ${escapeHtml(stateManager.project.creator)}</div>
                <div>version: ${escapeHtml(stateManager.project.version)}</div>
                <div>startScreen: ${escapeHtml(stateManager.project.startScreen)}</div>
                <div>projectRootPath: ${escapeHtml(stateManager.project.projectRootPath || 'not set')}</div>
              </div>
            </div>
            <div class="bg-cardDark border border-[#2d2d42] rounded-lg p-4 space-y-3">
              <h3 class="text-sm font-bold text-zinc-200 flex items-center gap-2"><i data-lucide="toggle-left" class="w-4 h-4 text-projectGoldGlow"></i> Enabled Modules</h3>
              <div class="space-y-2">
                ${(stateManager.project.enabledModules || []).map((item) => `<div class="p-2 rounded bg-black/25 border border-[#2d2d42] text-xs text-zinc-300">${escapeHtml(item)}</div>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderAssetBrowser() {
    if (refs.assetBrowserStage) {
      refs.assetBrowserStage.innerHTML = '<div class="h-full p-6 text-xs text-zinc-500">Asset Browser module loading...</div>';
    }
  }

  function renderGettingStartedWizard() {
    if (refs.wizardStage) {
      refs.wizardStage.innerHTML = '<div class="h-full p-6 text-xs text-zinc-500">Getting Started Wizard loading...</div>';
    }
  }

  function setWorkspace(workspace) {
    stateManager.activeWorkspace = workspace;
    if (refs.workspaceLabel) refs.workspaceLabel.textContent = workspace.toUpperCase();
    refs.manifestStage?.classList.toggle('hidden', workspace !== 'manifest');
    refs.flatplanStage?.classList.toggle('hidden', workspace !== 'flatplan');
    refs.stitcherStage?.classList.toggle('hidden', workspace !== 'stitcher');
    refs.buildPrepStage?.classList.toggle('hidden', workspace !== 'buildprep');
    refs.assetBrowserStage?.classList.toggle('hidden', workspace !== 'assetbrowser');
    refs.wizardStage?.classList.toggle('hidden', workspace !== 'wizard');

    if (workspace === 'manifest') renderManifest();
    if (workspace === 'flatplan') onRefresh?.();
    if (workspace === 'stitcher') renderStitcher?.();
    if (workspace === 'buildprep') renderBuildPrep?.();
    if (workspace === 'assetbrowser') renderAssetBrowser();
    if (workspace === 'wizard') renderGettingStartedWizard();
    if (window.lucide) window.lucide.createIcons();
  }

  function closeAllMenus() {
    document.querySelectorAll('.project-menu details[open]').forEach((menu) => menu.removeAttribute('open'));
  }

  function wireWorkspaceButtons() {
    document.querySelectorAll('[data-workspace-target]').forEach((button) => {
      button.onclick = () => {
        setWorkspace(button.dataset.workspaceTarget || 'flatplan');
        closeAllMenus();
      };
    });
  }

  function wireTopCanvasControls() {
    const zoomInBtn = getById('zoomInBtn');
    if (zoomInBtn) {
      zoomInBtn.onclick = () => {
        canvasController?.zoomByFactor(1.12);
        renderJsonPreview();
      };
    }

    const zoomOutBtn = getById('zoomOutBtn');
    if (zoomOutBtn) {
      zoomOutBtn.onclick = () => {
        canvasController?.zoomByFactor(0.88);
        renderJsonPreview();
      };
    }

    const resetViewportBtn = getById('resetViewportBtn');
    if (resetViewportBtn) {
      resetViewportBtn.onclick = () => {
        canvasController?.resetViewport();
        renderJsonPreview();
      };
    }

    jsonPreview.wireSplitStatePreviewToggle({ closeMenus: closeAllMenus });
    wireWorkspaceButtons();
  }

  return {
    renderCatalog,
    renderJsonPreview,
    renderInspectorPreview,
    renderManifest,
    renderAssetBrowser,
    renderGettingStartedWizard,
    setWorkspace,
    wireTopCanvasControls
  };
}
