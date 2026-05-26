// Artifex Project Editor UI workspace module
// Integration pass: catalog/sidebar UI, inspector UI, JSON preview, workspace
// switching, top toolbar wiring, shared Asset Browser shell, and Missing Setup Wizard.

const UI_STORAGE_KEYS = Object.freeze({
  splitStatePreviewVisible: 'artifex_project_split_state_preview_visible',
  inspectorPosition: 'artifex_project_inspector_position',
  assetBrowserMode: 'artifex_project_asset_browser_mode'
});

const LIBRARY_MODES = Object.freeze([
  { id: 'quests', label: 'Quest Library', icon: 'scroll-text', type: 'quest', file: 'quests/quest-index.json', sourceModule: 'quest-builder' },
  { id: 'sidequests', label: 'Side Quest Library', icon: 'git-branch', type: 'sidequest', file: 'sidequests/sidequest-index.json', sourceModule: 'quest-builder' },
  { id: 'scenes-screens', label: 'Scenes/Screens Library', icon: 'layout-template', type: 'scene-screen', file: 'scenes/scene-index.json + screens/screen-index.json', sourceModule: 'scene-editor' },
  { id: 'puzzles', label: 'Puzzle Library', icon: 'puzzle', type: 'puzzle', file: 'puzzles/puzzle-index.json', sourceModule: 'puzzle-library' },
  { id: 'archetype-objects', label: 'Archetype Object Library', icon: 'boxes', type: 'archobj', file: 'archetypes/object-index.json', sourceModule: 'archetype-object-creator' },
  { id: 'archetype-effects', label: 'Archetype Effect Library', icon: 'sparkles', type: 'archeffect', file: 'archetypes/effect-index.json', sourceModule: 'effect-editor' },
  { id: 'assets', label: 'Asset Browser', icon: 'image', type: 'asset', file: 'assets/asset-index.json', sourceModule: 'asset-library' }
]);

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

function readJSONPreference(key, fallback) {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`[ProjectUI] Could not read JSON preference ${key}`, error);
    return fallback;
  }
}

function writeJSONPreference(key, value) {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[ProjectUI] Could not write JSON preference ${key}`, error);
  }
}

function getById(id) {
  return document.getElementById(id);
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
  let inspectorPosition = readJSONPreference(UI_STORAGE_KEYS.inspectorPosition, { top: 16, right: 16 });
  let assetBrowserMode = globalThis.localStorage?.getItem(UI_STORAGE_KEYS.assetBrowserMode) || 'assets';
  let menuOutsideListenerAttached = false;

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

  function getWizardChecks() {
    const nodeIds = new Set(stateManager.logic.nodes.map((node) => node.id));
    const routeProblems = stateManager.logic.routes.filter((route) => !nodeIds.has(route.source) || !nodeIds.has(route.target));
    const linkedScenes = stateManager.logic.nodes.filter((node) => node.properties?.linkedSceneId);
    const startScreenOk = nodeIds.has(stateManager.project.startScreen) || Boolean(stateManager.project.startScreen);
    return [
      { name: 'Project manifest', detail: 'project.json / manifest state exists', pass: Boolean(stateManager.project?.projectId), owner: 'Creation Guide' },
      { name: 'Input map', detail: 'input-map.json should be generated by Creation Guide', pass: false, owner: 'Creation Guide / Project Settings' },
      { name: 'Library links', detail: 'library-links.json should map graph records to module outputs', pass: false, owner: 'Project Manager' },
      { name: 'Start screen', detail: stateManager.project.startScreen || 'No start screen set', pass: startScreenOk, owner: 'Project Manager + Scene Editor' },
      { name: 'Flatplan nodes', detail: `${stateManager.logic.nodes.length} nodes found`, pass: stateManager.logic.nodes.length > 0, owner: 'Project Manager' },
      { name: 'Route endpoints', detail: routeProblems.length ? `${routeProblems.length} route endpoint issue(s)` : 'All route endpoints resolve', pass: routeProblems.length === 0, owner: 'Project Manager' },
      { name: 'Linked scenes/screens', detail: `${linkedScenes.length} node(s) have linked scenes/screens`, pass: linkedScenes.length > 0, owner: 'Scene Editor + Project Manager' },
      { name: 'Quest library', detail: 'Quest index not loaded yet', pass: false, owner: 'Quest Builder' },
      { name: 'Puzzle library', detail: 'Puzzle index not loaded yet', pass: false, owner: 'Puzzle Library' },
      { name: 'Shared health guide', detail: 'Health checks should move to artifex/shared/health-guide/', pass: false, owner: 'Shared Health Guide' }
    ];
  }

  function renderGettingStartedWizard() {
    if (!refs.wizardStage) return;
    const checks = getWizardChecks();
    const passCount = checks.filter((check) => check.pass).length;
    refs.wizardStage.innerHTML = `
      <div class="h-full overflow-y-auto p-6">
        <div class="max-w-5xl mx-auto space-y-6">
          <div class="border-b border-[#2d2d42] pb-4 flex items-center justify-between gap-4">
            <div>
              <h2 class="text-xl font-bold tracking-wide text-zinc-100">Getting Started / Missing Setup Wizard</h2>
              <p class="text-xs text-zinc-500">This checks the current project package. New project creation belongs in Creation Guide.</p>
            </div>
            <span class="text-[10px] font-mono border border-projectGold/30 text-projectGoldGlow px-3 py-1 rounded-full">${passCount}/${checks.length} checks passed</span>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 bg-cardDark border border-[#2d2d42] rounded-xl p-5 space-y-3">
              ${checks.map((check) => `
                <div class="p-3 rounded-lg border ${check.pass ? 'border-projectGreen/30 bg-emerald-950/20' : 'border-orange-400/25 bg-orange-950/10'} flex justify-between gap-4">
                  <div>
                    <div class="text-sm font-semibold text-zinc-100">${escapeHtml(check.name)}</div>
                    <div class="text-xs text-zinc-500 mt-1">${escapeHtml(check.detail)}</div>
                    <div class="text-[10px] text-zinc-600 mt-1 font-mono">Owner: ${escapeHtml(check.owner)}</div>
                  </div>
                  <div class="text-[10px] font-mono font-bold ${check.pass ? 'text-projectGreen' : 'text-orange-300'}">${check.pass ? 'READY' : 'MISSING'}</div>
                </div>
              `).join('')}
            </div>
            <div class="bg-cardDark border border-[#2d2d42] rounded-xl p-5 space-y-4">
              <h3 class="text-sm font-bold text-projectGoldGlow flex items-center gap-2"><i data-lucide="route" class="w-4 h-4"></i> Setup order</h3>
              <ol class="text-xs text-zinc-400 space-y-2 list-decimal list-inside leading-relaxed">
                <li>Create/open project in Creation Guide.</li>
                <li>Generate project.json and input-map.json.</li>
                <li>Create scenes/screens in Scene Editor.</li>
                <li>Create quests, side quests, puzzles, objects, and effects in their owning modules.</li>
                <li>Assemble the project here in Flatplan and Stitcher.</li>
                <li>Run health checks, then hand off to Build Game.</li>
              </ol>
              <button data-workspace-target="flatplan" class="w-full bg-gradient-to-r from-accentDark to-projectGold border border-projectGold/40 text-white font-bold py-2.5 rounded-lg text-xs shadow-project-glow">Return to Flatplan</button>
            </div>
          </div>
        </div>
      </div>
    `;
    wireWorkspaceButtons();
  }

  function renderAssetBrowser(mode = assetBrowserMode) {
    if (!refs.assetBrowserStage) return;
    assetBrowserMode = LIBRARY_MODES.some((item) => item.id === mode) ? mode : 'assets';
    globalThis.localStorage?.setItem(UI_STORAGE_KEYS.assetBrowserMode, assetBrowserMode);
    const active = LIBRARY_MODES.find((item) => item.id === assetBrowserMode) || LIBRARY_MODES.at(-1);
    const sampleResults = LIBRARY_MODES.map((item) => ({
      id: `${item.type}_example`,
      type: item.type,
      name: `${item.label} example`,
      sourceModule: item.sourceModule,
      file: item.file,
      status: item.id === active.id ? 'selected mode' : 'available mode'
    }));

    refs.assetBrowserStage.innerHTML = `
      <div class="h-full p-6 flex flex-col gap-5">
        <div class="border-b border-[#2d2d42] pb-4 flex items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-bold tracking-wide text-zinc-100">Asset Browser</h2>
            <p class="text-xs text-zinc-500">Shared browser shell for quests, side quests, scenes/screens, puzzles, archetypes, effects, and assets.</p>
          </div>
          <span class="text-[10px] font-mono border border-projectGold/30 text-projectGoldGlow px-3 py-1 rounded-full">${escapeHtml(active.label)}</span>
        </div>
        <div class="flex-1 grid grid-cols-[72px_1fr] gap-4 min-h-0">
          <div class="bg-cardDark border border-[#2d2d42] rounded-xl p-2 flex flex-col gap-2">
            ${LIBRARY_MODES.map((item) => `
              <button data-library-mode="${escapeHtml(item.id)}" title="${escapeHtml(item.label)}" class="w-12 h-12 rounded-xl border ${item.id === active.id ? 'border-projectGold/70 bg-accentDark/60 text-projectGoldGlow' : 'border-zinc-800 bg-black/25 text-zinc-500 hover:text-projectGoldGlow hover:border-projectGold/40'} flex items-center justify-center transition">
                <i data-lucide="${escapeHtml(item.icon)}" class="w-5 h-5"></i>
              </button>
            `).join('')}
          </div>
          <div class="bg-cardDark border border-[#2d2d42] rounded-xl p-5 min-h-0 flex flex-col gap-4">
            <div class="grid grid-cols-[1fr_auto_auto] gap-3">
              <input placeholder="Search ${escapeHtml(active.label)}..." class="bg-black/40 border border-[#2d2d42] rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none">
              <button class="px-3 py-2 rounded-lg border border-projectGold/30 text-xs text-projectGoldGlow bg-accentDark/20">Filters</button>
              <button class="px-3 py-2 rounded-lg border border-projectGold/30 text-xs text-projectGoldGlow bg-accentDark/20">Refresh</button>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-y-auto pr-1">
              ${sampleResults.map((item) => `
                <div class="p-3 rounded-lg border border-[#2d2d42] bg-black/25">
                  <div class="text-sm font-semibold text-zinc-100">${escapeHtml(item.name)}</div>
                  <div class="text-[10px] text-zinc-500 mt-1 font-mono">${escapeHtml(item.id)} · ${escapeHtml(item.type)}</div>
                  <div class="text-[10px] text-zinc-600 mt-1 font-mono">${escapeHtml(item.file)}</div>
                  <div class="mt-2 flex justify-between text-[10px]"><span class="text-projectGoldGlow">${escapeHtml(item.sourceModule)}</span><span class="text-zinc-500">${escapeHtml(item.status)}</span></div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    refs.assetBrowserStage.querySelectorAll('[data-library-mode]').forEach((button) => {
      button.addEventListener('click', () => renderAssetBrowser(button.dataset.libraryMode));
    });
    if (window.lucide) window.lucide.createIcons();
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

  function closeAllMenus(except = null) {
    document.querySelectorAll('.project-menu details[open]').forEach((menu) => {
      if (menu !== except) menu.removeAttribute('open');
    });
  }

  function wireWorkspaceButtons() {
    document.querySelectorAll('[data-workspace-target]').forEach((button) => {
      button.onclick = () => {
        setWorkspace(button.dataset.workspaceTarget || 'flatplan');
        closeAllMenus();
      };
    });
  }

  function wireMenuBehavior() {
    document.querySelectorAll('.project-menu details').forEach((menu) => {
      menu.ontoggle = () => {
        if (menu.open) closeAllMenus(menu);
      };
    });

    if (!menuOutsideListenerAttached) {
      menuOutsideListenerAttached = true;
      document.addEventListener('pointerdown', (event) => {
        if (!event.target.closest?.('.project-menu')) closeAllMenus();
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeAllMenus();
      });
    }
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

    document.querySelectorAll('[data-library-target]').forEach((button) => {
      button.onclick = () => {
        assetBrowserMode = button.dataset.libraryTarget || 'assets';
        setWorkspace('assetbrowser');
        closeAllMenus();
      };
    });

    wireWorkspaceButtons();
    wireMenuBehavior();
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
