// Artifex Project Editor UI workspace module
// Step 7 of the Project Editor real split.
//
// Owns catalog/sidebar UI, inspector UI, JSON preview, workspace switching,
// and top toolbar wiring for the split shell.

const UI_STORAGE_KEYS = Object.freeze({
  splitStatePreviewVisible: 'artifex_project_split_state_preview_visible'
});

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function readBooleanPreference(key, fallback = false) {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (raw === 'true') return true;
    if (raw === 'false') return false;
  } catch (error) {
    console.warn(`[ProjectUI] Could not read UI preference ${key}`, error);
  }
  return fallback;
}

function writeBooleanPreference(key, value) {
  try {
    globalThis.localStorage?.setItem(key, String(Boolean(value)));
  } catch (error) {
    console.warn(`[ProjectUI] Could not write UI preference ${key}`, error);
  }
}

export function createProjectUI({
  stateManager,
  getTypeStyle,
  renderer,
  canvasController,
  onRefresh,
  onGraphChanged,
  renderStitcher,
  renderBuildPrep
}) {
  let splitStatePreviewVisible = readBooleanPreference(UI_STORAGE_KEYS.splitStatePreviewVisible, false);

  const refs = {
    sidebar: document.getElementById('sidebarAccordion'),
    canvas: document.getElementById('flatplanCanvas'),
    workspaceLabel: document.getElementById('activeWorkspaceName'),
    workspaceStage: document.getElementById('workspaceStage'),
    flatplanStage: document.getElementById('flatplanCanvas'),
    manifestStage: document.getElementById('manifestWorkspace'),
    stitcherStage: document.getElementById('stitcherWorkspace'),
    buildPrepStage: document.getElementById('buildPrepWorkspace')
  };

  function renderCatalog() {
    if (!refs.sidebar) return;

    const placeholders = stateManager.catalog.placeholders;
    const realAssets = stateManager.catalog.realAssets;

    const placeholderCards = placeholders.map((item) => {
      const style = getTypeStyle(item.type);
      return `
        <button class="bg-black/25 hover:bg-accentDark/40 border border-projectGold/20 hover:border-projectGold/60 p-2 rounded text-left transition" data-catalog-type="${escapeHtml(item.type)}">
          <i data-lucide="${escapeHtml(style.icon || item.icon || 'box')}" class="w-4 h-4 mb-1 ${escapeHtml(style.color)}"></i>
          <span class="text-[11px] font-semibold text-zinc-200 block truncate">${escapeHtml(item.label)}</span>
        </button>
      `;
    }).join('');

    const realAssetCards = realAssets.map((item) => `
      <div class="flex items-center space-x-3 bg-black/25 hover:bg-black/50 border border-zinc-800 hover:border-projectGold/50 p-2 rounded transition">
        <div class="w-10 h-10 bg-accentDark/40 rounded flex items-center justify-center border border-projectGold/20">
          <i data-lucide="${escapeHtml(item.icon || 'image')}" class="w-5 h-5 text-projectGoldGlow"></i>
        </div>
        <div class="flex-1 min-w-0">
          <span class="text-xs font-semibold text-zinc-200 block truncate">${escapeHtml(item.name)}</span>
          <span class="text-[9px] text-zinc-500 block truncate">${escapeHtml(item.file)}</span>
        </div>
      </div>
    `).join('');

    refs.sidebar.innerHTML = `
      <div class="border border-[#2d2d42] rounded-lg overflow-hidden bg-cardDark">
        <button class="w-full flex items-center justify-between p-3 bg-black/25 font-semibold text-sm hover:bg-black/40 transition text-zinc-200">
          <div class="flex items-center space-x-2">
            <i data-lucide="library" class="w-4 h-4 text-projectGoldGlow"></i>
            <span>Flatplan Catalog</span>
          </div>
        </button>
        <div class="p-3 border-t border-[#1d1d2b] space-y-3">
          <div>
            <div class="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">Placeholders</div>
            <div class="grid grid-cols-2 gap-2">${placeholderCards}</div>
          </div>
          <div>
            <div class="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">Real Assets</div>
            <div class="space-y-2">${realAssetCards}</div>
          </div>
        </div>
      </div>
    `;

    refs.sidebar.querySelectorAll('[data-catalog-type]').forEach((button) => {
      button.addEventListener('click', () => {
        const type = button.dataset.catalogType || 'Station';
        const camera = stateManager.camera;
        stateManager.addNode({
          type,
          position: {
            x: Math.round((180 - camera.panX) / camera.zoom + stateManager.logic.nodes.length * 24),
            y: Math.round((160 - camera.panY) / camera.zoom + stateManager.logic.nodes.length * 18)
          }
        });
        onRefresh?.();
      });
    });
  }

  function updateSplitPreviewMenuLabel() {
    const toggle = document.getElementById('toggleSplitStatePreview');
    if (!toggle) return;
    toggle.textContent = splitStatePreviewVisible ? 'Hide Split State Preview' : 'Show Split State Preview';
  }

  function renderJsonPreview() {
    const existing = document.getElementById('splitDataPreview');
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

  function renderInspectorPreview() {
    const existing = document.getElementById('splitInspectorPreview');
    if (existing) existing.remove();
    if (!refs.canvas) return;

    const selectedNode = stateManager.selectedNodeId ? stateManager.getNode(stateManager.selectedNodeId) : null;
    const selectedRoute = stateManager.selectedEdgeId ? stateManager.getRoute(stateManager.selectedEdgeId) : null;

    const panel = document.createElement('div');
    panel.id = 'splitInspectorPreview';
    panel.className = 'absolute top-4 right-4 z-30 w-[300px] bg-cardDark/85 backdrop-blur-md border border-projectGold/30 rounded-lg shadow-card-glow';

    if (selectedNode) {
      panel.innerHTML = `
        <div class="px-3 py-2 border-b border-[#2d2d42] text-xs font-bold text-projectGoldGlow">Selected Node</div>
        <div class="p-3 space-y-2">
          <div class="text-[10px] font-mono text-zinc-500">${escapeHtml(selectedNode.id)} · ${escapeHtml(selectedNode.type)}</div>
          <label class="block text-[10px] font-mono text-zinc-500">NAME</label>
          <input id="splitNodeNameInput" value="${escapeHtml(selectedNode.properties.name)}" class="w-full bg-black/40 border border-[#2d2d42] rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none">
          <label class="block text-[10px] font-mono text-zinc-500">DESCRIPTION</label>
          <textarea id="splitNodeDescInput" rows="3" class="w-full bg-black/40 border border-[#2d2d42] rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none">${escapeHtml(selectedNode.properties.description)}</textarea>
          <button id="deleteSplitNodeBtn" class="w-full bg-red-950/40 border border-red-500/30 hover:bg-red-900/50 text-red-200 px-3 py-1.5 rounded text-xs transition">Delete Node</button>
        </div>
      `;
      refs.canvas.appendChild(panel);
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
        <div class="px-3 py-2 border-b border-[#2d2d42] text-xs font-bold text-projectGoldGlow">Selected Route</div>
        <div class="p-3 space-y-2 text-xs text-zinc-400">
          <div class="text-[10px] font-mono text-zinc-500">${escapeHtml(selectedRoute.id)}</div>
          <div>${escapeHtml(selectedRoute.source)} → ${escapeHtml(selectedRoute.target)}</div>
          <div>Type: ${escapeHtml(selectedRoute.type)}</div>
        </div>
      `;
      refs.canvas.appendChild(panel);
      return;
    }

    panel.innerHTML = `
      <div class="px-3 py-2 border-b border-[#2d2d42] text-xs font-bold text-projectGoldGlow">Inspector</div>
      <div class="p-3 text-xs text-zinc-500 leading-relaxed">Click or drag a node. Scrollwheel-click / third mouse button drag pans the canvas. Mousewheel zooms. Click a catalog placeholder to create a new node.</div>
    `;
    refs.canvas.appendChild(panel);
  }

  function renderManifest() {
    if (!refs.manifestStage) return;
    refs.manifestStage.innerHTML = `
      <div class="h-full overflow-y-auto p-6">
        <div class="max-w-4xl mx-auto space-y-6">
          <div class="border-b border-[#2d2d42] pb-4">
            <h2 class="text-xl font-bold tracking-wide text-zinc-100">Project Manifest</h2>
            <p class="text-xs text-zinc-500">Global project setup, start screen, and enabled modules.</p>
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
              </div>
            </div>
            <div class="bg-cardDark border border-[#2d2d42] rounded-lg p-4 space-y-3">
              <h3 class="text-sm font-bold text-zinc-200 flex items-center gap-2"><i data-lucide="toggle-left" class="w-4 h-4 text-projectGoldGlow"></i> Enabled Modules</h3>
              <div class="space-y-2">
                ${stateManager.project.enabledModules.map((item) => `<div class="p-2 rounded bg-black/25 border border-[#2d2d42] text-xs text-zinc-300">${escapeHtml(item)}</div>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function setWorkspace(workspace) {
    stateManager.activeWorkspace = workspace;
    if (refs.workspaceLabel) refs.workspaceLabel.textContent = workspace.toUpperCase();
    refs.manifestStage?.classList.toggle('hidden', workspace !== 'manifest');
    refs.flatplanStage?.classList.toggle('hidden', workspace !== 'flatplan');
    refs.stitcherStage?.classList.toggle('hidden', workspace !== 'stitcher');
    refs.buildPrepStage?.classList.toggle('hidden', workspace !== 'buildprep');

    if (workspace === 'manifest') renderManifest();
    if (workspace === 'flatplan') onRefresh?.();
    if (workspace === 'stitcher') renderStitcher?.();
    if (workspace === 'buildprep') renderBuildPrep?.();
    if (window.lucide) window.lucide.createIcons();
  }

  function closeAllMenus() {
    document.querySelectorAll('.project-menu details[open]').forEach((menu) => {
      menu.removeAttribute('open');
    });
  }

  function wireTopCanvasControls() {
    const zoomInBtn = document.getElementById('zoomInBtn');
    if (zoomInBtn) {
      zoomInBtn.onclick = () => {
        canvasController?.zoomByFactor(1.12);
        renderJsonPreview();
      };
    }

    const zoomOutBtn = document.getElementById('zoomOutBtn');
    if (zoomOutBtn) {
      zoomOutBtn.onclick = () => {
        canvasController?.zoomByFactor(0.88);
        renderJsonPreview();
      };
    }

    const resetViewportBtn = document.getElementById('resetViewportBtn');
    if (resetViewportBtn) {
      resetViewportBtn.onclick = () => {
        canvasController?.resetViewport();
        renderJsonPreview();
      };
    }

    const toggleSplitStatePreviewButton = document.getElementById('toggleSplitStatePreview');
    if (toggleSplitStatePreviewButton) {
      toggleSplitStatePreviewButton.onclick = () => {
        toggleSplitStatePreview();
        closeAllMenus();
      };
    }
    updateSplitPreviewMenuLabel();

    document.querySelectorAll('[data-workspace-target]').forEach((button) => {
      button.onclick = () => {
        setWorkspace(button.dataset.workspaceTarget || 'flatplan');
        closeAllMenus();
      };
    });
  }

  return {
    renderCatalog,
    renderJsonPreview,
    renderInspectorPreview,
    renderManifest,
    setWorkspace,
    wireTopCanvasControls
  };
}
