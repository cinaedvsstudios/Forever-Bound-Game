import { UI_STORAGE_KEYS, escapeHtml, getById, readBooleanPreference, readJSONPreference, writeBooleanPreference, writeJSONPreference } from './project-ui-helpers.js?v=0.1.27-sidebar';
import { renderProjectCatalog } from './project-sidebar-ui.js?v=0.1.27-sidebar';

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
  let splitStatePreviewVisible = readBooleanPreference(UI_STORAGE_KEYS.splitStatePreviewVisible, false);
  let inspectorPosition = readJSONPreference(UI_STORAGE_KEYS.inspectorPosition, { top: 16, right: 16 });

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

  function renderCatalog() {
    renderProjectCatalog({
      sidebar: refs.sidebar,
      stateManager,
      getTypeStyle,
      onRefresh
    });
  }

  function updateSplitPreviewMenuLabel() {
    const toggle = getById('toggleSplitStatePreview');
    if (!toggle) return;
    toggle.textContent = splitStatePreviewVisible ? 'Hide Split State Preview' : 'Show Split State Preview';
  }

  function renderJsonPreview() {
    const existing = getById('splitDataPreview');
    if (existing) existing.remove();
    updateSplitPreviewMenuLabel();
    if (!refs.canvas || !splitStatePreviewVisible) return;

    const panel = document.createElement('div');
    panel.id = 'splitDataPreview';
    panel.className = 'absolute bottom-4 right-4 z-30 w-[360px] max-h-[280px] overflow-hidden bg-cardDark/85 backdrop-blur-md border border-projectGold/30 rounded-lg shadow-card-glow';
    panel.innerHTML = `
      <div class="flex items-center justify-between px-3 py-2 border-b border-[#2d2d42]">
        <span class="text-xs font-bold text-projectGoldGlow">Split State Preview</span>
        <div class="flex items-center gap-3">
          <button id="hideSplitStatePreviewBtn" class="text-[9px] font-mono text-zinc-500 hover:text-projectGoldGlow transition">hide</button>
          <button id="resetSplitStateBtn" class="text-[9px] font-mono text-zinc-500 hover:text-projectGoldGlow transition">reset</button>
        </div>
      </div>
      <pre class="p-3 text-[9px] leading-relaxed text-emerald-300 overflow-auto max-h-[220px]">${escapeHtml(JSON.stringify(stateManager.exportSnapshot(), null, 2))}</pre>
    `;
    refs.canvas.appendChild(panel);
    panel.querySelector('#hideSplitStatePreviewBtn')?.addEventListener('click', () => {
      splitStatePreviewVisible = false;
      writeBooleanPreference(UI_STORAGE_KEYS.splitStatePreviewVisible, splitStatePreviewVisible);
      renderJsonPreview();
    });
    panel.querySelector('#resetSplitStateBtn')?.addEventListener('click', () => {
      stateManager.resetToDefaults();
      onRefresh?.();
    });
  }

  function toggleSplitStatePreview() {
    splitStatePreviewVisible = !splitStatePreviewVisible;
    writeBooleanPreference(UI_STORAGE_KEYS.splitStatePreviewVisible, splitStatePreviewVisible);
    renderJsonPreview();
  }

  function getInspectorStatusFooter() {
    return `
      <div class="border-t border-[#2d2d42] px-3 py-2 bg-black/25 text-[10px] text-zinc-500 leading-relaxed rounded-b-lg">
        <div class="flex items-center gap-1.5 text-projectGoldGlow font-bold mb-1">
          <i data-lucide="info" class="w-3 h-3"></i>
          <span>Canvas controls</span>
        </div>
        <div>Drag nodes with left mouse. Scrollwheel-click / middle-button drag pans. Mousewheel zooms.</div>
      </div>
    `;
  }

  function applyInspectorPosition(panel) {
    const top = Number(inspectorPosition?.top);
    const right = Number(inspectorPosition?.right);
    panel.style.top = `${Number.isFinite(top) ? Math.max(8, top) : 16}px`;
    panel.style.right = `${Number.isFinite(right) ? Math.max(8, right) : 16}px`;
    panel.style.left = 'auto';
  }

  function makeInspectorDraggable(panel) {
    const handle = panel.querySelector('[data-inspector-drag-handle]');
    const resetButton = panel.querySelector('[data-inspector-reset-position]');
    if (!handle) return;

    handle.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      const canvasRect = refs.canvas.getBoundingClientRect();
      const startRect = panel.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      const startLeft = startRect.left - canvasRect.left;
      const startTop = startRect.top - canvasRect.top;
      const panelWidth = startRect.width;
      const panelHeight = startRect.height;

      handle.setPointerCapture?.(event.pointerId);
      panel.classList.add('ring-1', 'ring-projectGold/50');

      const onMove = (moveEvent) => {
        const nextLeft = Math.max(8, Math.min(canvasRect.width - panelWidth - 8, startLeft + moveEvent.clientX - startX));
        const nextTop = Math.max(8, Math.min(canvasRect.height - panelHeight - 8, startTop + moveEvent.clientY - startY));
        const nextRight = Math.max(8, canvasRect.width - nextLeft - panelWidth);
        panel.style.left = 'auto';
        panel.style.right = `${nextRight}px`;
        panel.style.top = `${nextTop}px`;
        inspectorPosition = { top: Math.round(nextTop), right: Math.round(nextRight) };
      };

      const onUp = () => {
        panel.classList.remove('ring-1', 'ring-projectGold/50');
        writeJSONPreference(UI_STORAGE_KEYS.inspectorPosition, inspectorPosition);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp, { once: true });
    });

    resetButton?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      inspectorPosition = { top: 16, right: 16 };
      writeJSONPreference(UI_STORAGE_KEYS.inspectorPosition, inspectorPosition);
      applyInspectorPosition(panel);
    });
  }

  function finishInspectorPanel(panel) {
    refs.canvas.appendChild(panel);
    applyInspectorPosition(panel);
    makeInspectorDraggable(panel);
    if (window.lucide) window.lucide.createIcons();
  }

  function renderInspectorPreview() {
    const existing = getById('splitInspectorPreview');
    if (existing) existing.remove();
    if (!refs.canvas) return;

    const selectedNode = stateManager.selectedNodeId ? stateManager.getNode(stateManager.selectedNodeId) : null;
    const selectedRoute = stateManager.selectedEdgeId ? stateManager.getRoute(stateManager.selectedEdgeId) : null;

    const panel = document.createElement('div');
    panel.id = 'splitInspectorPreview';
    panel.className = 'absolute z-30 w-[300px] bg-cardDark/85 backdrop-blur-md border border-projectGold/30 rounded-lg shadow-card-glow';

    if (selectedNode) {
      panel.innerHTML = `
        <div data-inspector-drag-handle class="px-3 py-2 border-b border-[#2d2d42] text-xs font-bold text-projectGoldGlow flex items-center justify-between cursor-move select-none">
          <span>Selected Node</span>
          <button data-inspector-reset-position class="text-[9px] font-mono text-zinc-500 hover:text-projectGoldGlow cursor-pointer">reset pos</button>
        </div>
        <div class="p-3 space-y-2">
          <div class="text-[10px] font-mono text-zinc-500">${escapeHtml(selectedNode.id)} · ${escapeHtml(selectedNode.type)}</div>
          <label class="block text-[10px] font-mono text-zinc-500">NAME</label>
          <input id="splitNodeNameInput" value="${escapeHtml(selectedNode.properties.name)}" class="w-full bg-black/40 border border-[#2d2d42] rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none">
          <label class="block text-[10px] font-mono text-zinc-500">DESCRIPTION</label>
          <textarea id="splitNodeDescInput" rows="3" class="w-full bg-black/40 border border-[#2d2d42] rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none">${escapeHtml(selectedNode.properties.description)}</textarea>
          <button id="deleteSplitNodeBtn" class="w-full bg-red-950/40 border border-red-500/30 hover:bg-red-900/50 text-red-200 px-3 py-1.5 rounded text-xs transition">Delete Node</button>
        </div>
        ${getInspectorStatusFooter()}
      `;
      finishInspectorPanel(panel);
      panel.querySelector('#splitNodeNameInput')?.addEventListener('input', (event) => {
        stateManager.updateNode(selectedNode.id, { properties: { name: event.target.value } });
        renderer?.renderGraph();
        renderJsonPreview();
        if (window.lucide) window.lucide.createIcons();
      });
      panel.querySelector('#splitNodeDescInput')?.addEventListener('input', (event) => {
        stateManager.updateNode(selectedNode.id, { properties: { description: event.target.value } });
        renderer?.renderGraph();
        renderJsonPreview();
        if (window.lucide) window.lucide.createIcons();
      });
      panel.querySelector('#deleteSplitNodeBtn')?.addEventListener('click', () => {
        stateManager.deleteNode(selectedNode.id);
        onRefresh?.();
      });
      return;
    }

    if (selectedRoute) {
      panel.innerHTML = `
        <div data-inspector-drag-handle class="px-3 py-2 border-b border-[#2d2d42] text-xs font-bold text-projectGoldGlow flex items-center justify-between cursor-move select-none">
          <span>Selected Route</span>
          <button data-inspector-reset-position class="text-[9px] font-mono text-zinc-500 hover:text-projectGoldGlow cursor-pointer">reset pos</button>
        </div>
        <div class="p-3 space-y-2 text-xs text-zinc-400">
          <div class="text-[10px] font-mono text-zinc-500">${escapeHtml(selectedRoute.id)}</div>
          <div>${escapeHtml(selectedRoute.source)} → ${escapeHtml(selectedRoute.target)}</div>
          <div>Type: ${escapeHtml(selectedRoute.type)}</div>
        </div>
        ${getInspectorStatusFooter()}
      `;
      finishInspectorPanel(panel);
      return;
    }

    panel.innerHTML = `
      <div data-inspector-drag-handle class="px-3 py-2 border-b border-[#2d2d42] text-xs font-bold text-projectGoldGlow flex items-center justify-between cursor-move select-none">
        <span>Inspector</span>
        <button data-inspector-reset-position class="text-[9px] font-mono text-zinc-500 hover:text-projectGoldGlow cursor-pointer">reset pos</button>
      </div>
      <div class="p-3 text-xs text-zinc-500 leading-relaxed">Click a node or route to edit it here. Drag this inspector from its header.</div>
      ${getInspectorStatusFooter()}
    `;
    finishInspectorPanel(panel);
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

    const toggleSplitStatePreviewButton = getById('toggleSplitStatePreview');
    if (toggleSplitStatePreviewButton) {
      toggleSplitStatePreviewButton.onclick = () => {
        toggleSplitStatePreview();
        closeAllMenus();
      };
    }
    updateSplitPreviewMenuLabel();
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
