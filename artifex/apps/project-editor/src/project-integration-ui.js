// Artifex Project Manager integration UI shell
// Adds shared-project integration surfaces without bloating project-ui.js.

const INTEGRATION_STORAGE_KEYS = Object.freeze({
  assetBrowserMode: 'artifex_project_asset_browser_mode',
  menuWired: 'artifex_project_menu_wired'
});

const LIBRARY_MODES = Object.freeze([
  { id: 'quests', label: 'Quest Library', icon: 'scroll-text', file: 'quests/quest-index.json', owner: 'Quest Builder' },
  { id: 'sidequests', label: 'Side Quest Library', icon: 'git-branch', file: 'sidequests/sidequest-index.json', owner: 'Quest Builder' },
  { id: 'scenes-screens', label: 'Scenes/Screens Library', icon: 'layout-panel-top', file: 'scenes/scene-index.json + screens/screen-index.json', owner: 'Scene Editor' },
  { id: 'puzzles', label: 'Puzzle Library', icon: 'puzzle', file: 'puzzles/puzzle-index.json', owner: 'Puzzle Builder / Library' },
  { id: 'archetype-objects', label: 'Archetype Object Library', icon: 'boxes', file: 'archetypes/object-index.json', owner: 'Archetype Object Creator' },
  { id: 'archetype-effects', label: 'Archetype Effect Library', icon: 'sparkles', file: 'archetypes/effect-index.json', owner: 'Effect Editor' },
  { id: 'assets', label: 'Asset Browser', icon: 'image', file: 'assets/asset-index.json', owner: 'Asset Library' }
]);

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getStorageItem(key, fallback = '') {
  try {
    return globalThis.localStorage?.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function setStorageItem(key, value) {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    // non-fatal
  }
}

function closeAllMenus() {
  document.querySelectorAll('.project-menu details[open]').forEach((menu) => menu.removeAttribute('open'));
}

function wireMenuBehaviourOnce() {
  if (window.__artifexProjectMenuWired) return;
  window.__artifexProjectMenuWired = true;

  document.addEventListener('toggle', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLDetailsElement)) return;
    if (!target.matches('[data-project-menu]')) return;
    if (!target.open) return;
    document.querySelectorAll('[data-project-menu][open]').forEach((menu) => {
      if (menu !== target) menu.removeAttribute('open');
    });
  }, true);

  document.addEventListener('pointerdown', (event) => {
    if (event.target?.closest?.('.project-menu')) return;
    closeAllMenus();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllMenus();
  });
}

function buildProjectSetupChecks(stateManager) {
  const nodeIds = new Set(stateManager.logic.nodes.map((node) => node.id));
  const connectedIds = new Set();
  const invalidRoutes = [];
  stateManager.logic.routes.forEach((route) => {
    if (!nodeIds.has(route.source) || !nodeIds.has(route.target)) invalidRoutes.push(route.id);
    connectedIds.add(route.source);
    connectedIds.add(route.target);
  });

  const hasStartScreen = Boolean(stateManager.project?.startScreen || stateManager.project?.startScreenId);
  const startTarget = stateManager.project?.startScreen || stateManager.project?.startScreenId || '';
  const orphanedNodes = stateManager.logic.nodes.filter((node) => !connectedIds.has(node.id));
  const linkedScenes = stateManager.logic.nodes.filter((node) => node.properties?.linkedSceneId);

  return [
    {
      label: 'Project manifest exists',
      detail: 'project.json / Project Manifest is loaded in editor state.',
      pass: Boolean(stateManager.project?.projectId),
      owner: 'Creation Guide',
      creationGuideAction: true
    },
    {
      label: 'Start screen assigned',
      detail: hasStartScreen ? `Current target: ${startTarget}` : 'Missing start screen reference.',
      pass: hasStartScreen,
      owner: 'Project Manager'
    },
    {
      label: 'Input map expected',
      detail: 'Creation Guide should create input-map.json; Project Manager validates action mappings.',
      pass: false,
      owner: 'Creation Guide / Project Settings',
      creationGuideAction: true
    },
    {
      label: 'Library links expected',
      detail: 'library-links.json should normalize links to scenes, quests, puzzles, archetypes, FX, and assets.',
      pass: false,
      owner: 'Project Manager'
    },
    {
      label: 'Flatplan has nodes',
      detail: `${stateManager.logic.nodes.length} node(s) in current graph.`,
      pass: stateManager.logic.nodes.length > 0,
      owner: 'Project Manager'
    },
    {
      label: 'Routes resolve',
      detail: invalidRoutes.length ? `Invalid routes: ${invalidRoutes.join(', ')}` : `${stateManager.logic.routes.length} route(s) resolve.`,
      pass: invalidRoutes.length === 0,
      owner: 'Project Manager / Stitcher'
    },
    {
      label: 'Nodes link to scenes/screens',
      detail: linkedScenes.length ? `${linkedScenes.length} node(s) have linked scene IDs.` : 'No linked scene/screen IDs detected yet.',
      pass: linkedScenes.length > 0,
      owner: 'Scene Editor + Project Manager'
    },
    {
      label: 'Orphaned nodes reviewed',
      detail: orphanedNodes.length ? `${orphanedNodes.length} orphaned node(s) should be checked.` : 'No orphaned nodes detected.',
      pass: orphanedNodes.length === 0,
      owner: 'Project Manager'
    }
  ];
}

function renderAssetBrowser({ stateManager, ui }) {
  const container = document.getElementById('assetBrowserWorkspace');
  if (!container) return;

  const activeModeId = getStorageItem(INTEGRATION_STORAGE_KEYS.assetBrowserMode, 'assets');
  const activeMode = LIBRARY_MODES.find((mode) => mode.id === activeModeId) || LIBRARY_MODES.at(-1);

  container.innerHTML = `
    <div class="h-full overflow-hidden p-5">
      <div class="h-full max-w-7xl mx-auto bg-cardDark/80 border border-projectGold/25 rounded-2xl shadow-card-glow overflow-hidden grid grid-cols-[76px_1fr]">
        <aside class="bg-black/25 border-r border-[#2d2d42] p-2 flex flex-col gap-2">
          ${LIBRARY_MODES.map((mode) => `
            <button data-asset-browser-mode="${escapeHtml(mode.id)}" title="${escapeHtml(mode.label)}" class="h-12 rounded-xl border ${mode.id === activeMode.id ? 'border-projectGold/70 bg-accentDark/60 text-projectGoldGlow' : 'border-zinc-800 bg-black/20 text-zinc-500 hover:text-projectGoldGlow hover:border-projectGold/40'} flex items-center justify-center transition">
              <i data-lucide="${escapeHtml(mode.icon)}" class="w-5 h-5"></i>
            </button>
          `).join('')}
        </aside>

        <section class="min-w-0 flex flex-col">
          <div class="px-5 py-4 border-b border-[#2d2d42] flex items-center justify-between gap-4">
            <div>
              <h2 class="text-lg font-bold text-zinc-100 tracking-wide">${escapeHtml(activeMode.label)}</h2>
              <p class="text-xs text-zinc-500">Shared browser shell · Owner: ${escapeHtml(activeMode.owner)} · Expected index: <span class="font-mono text-projectGoldGlow">${escapeHtml(activeMode.file)}</span></p>
            </div>
            <button data-return-flatplan class="px-3 py-2 rounded-lg border border-projectGold/30 text-xs text-projectGoldGlow hover:bg-accentDark/50 transition">Return to Flatplan</button>
          </div>

          <div class="p-4 border-b border-[#2d2d42] grid grid-cols-[1fr_auto_auto] gap-3">
            <input placeholder="Search ${escapeHtml(activeMode.label)}..." class="bg-black/40 border border-[#2d2d42] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-projectGold/50">
            <button class="px-3 py-2 rounded-lg border border-[#2d2d42] text-xs text-zinc-500 cursor-default">Filters</button>
            <button class="px-3 py-2 rounded-lg border border-[#2d2d42] text-xs text-zinc-500 cursor-default">Refresh Index</button>
          </div>

          <div class="flex-1 grid grid-cols-[1fr_320px] min-h-0">
            <div class="p-5 overflow-y-auto">
              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                ${[1, 2, 3, 4, 5, 6].map((item) => `
                  <div class="rounded-xl border border-[#2d2d42] bg-black/25 p-3">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-lg bg-accentDark/40 border border-projectGold/25 flex items-center justify-center text-projectGoldGlow"><i data-lucide="${escapeHtml(activeMode.icon)}" class="w-5 h-5"></i></div>
                      <div class="min-w-0">
                        <div class="text-xs font-bold text-zinc-200 truncate">${escapeHtml(activeMode.label)} Item ${item}</div>
                        <div class="text-[9px] font-mono text-zinc-600 truncate">${escapeHtml(activeMode.id)}_placeholder_${item}</div>
                      </div>
                    </div>
                    <div class="mt-3 text-[10px] text-zinc-500">Placeholder result. Real data will come from ${escapeHtml(activeMode.file)}.</div>
                  </div>
                `).join('')}
              </div>
            </div>
            <aside class="border-l border-[#2d2d42] bg-black/20 p-4 overflow-y-auto">
              <h3 class="text-sm font-bold text-projectGoldGlow mb-2">Preview / Details</h3>
              <p class="text-xs text-zinc-500 leading-relaxed">This panel will show selected library item metadata, owning module, source file, tags, readiness, and quick actions such as link to selected node or open in source module.</p>
              <div class="mt-4 rounded-lg border border-[#2d2d42] bg-black/30 p-3 text-[10px] font-mono text-zinc-500 space-y-1">
                <div>mode: ${escapeHtml(activeMode.id)}</div>
                <div>owner: ${escapeHtml(activeMode.owner)}</div>
                <div>index: ${escapeHtml(activeMode.file)}</div>
                <div>status: shell only</div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-asset-browser-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      setStorageItem(INTEGRATION_STORAGE_KEYS.assetBrowserMode, button.dataset.assetBrowserMode || 'assets');
      renderAssetBrowser({ stateManager, ui });
      if (window.lucide) window.lucide.createIcons();
    });
  });

  container.querySelector('[data-return-flatplan]')?.addEventListener('click', () => {
    ui?.setWorkspace?.('flatplan');
  });

  if (window.lucide) window.lucide.createIcons();
}

function renderGettingStartedWizard({ stateManager }) {
  const container = document.getElementById('wizardWorkspace');
  if (!container) return;

  const checks = buildProjectSetupChecks(stateManager);
  const passed = checks.filter((check) => check.pass).length;
  const needsCreationGuide = checks.some((check) => !check.pass && check.creationGuideAction);

  container.innerHTML = `
    <div class="h-full overflow-y-auto p-6">
      <div class="max-w-5xl mx-auto space-y-5">
        <div class="border-b border-[#2d2d42] pb-4 flex items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-bold tracking-wide text-zinc-100">Getting Started / Missing Setup Wizard</h2>
            <p class="text-xs text-zinc-500">This does not create a new project. It inspects the current project package and shows missing setup.</p>
          </div>
          <div class="flex items-center gap-3">
            ${needsCreationGuide ? '<a href="../creation-guide/" class="px-3 py-2 rounded-lg border border-projectGold/40 bg-accentDark/35 text-xs text-projectGoldGlow hover:bg-accentDark/60 transition">Open Creation Guide</a>' : ''}
            <div class="text-right">
              <div class="text-2xl font-black text-projectGoldGlow">${passed}/${checks.length}</div>
              <div class="text-[10px] text-zinc-500 font-mono">checks passed</div>
            </div>
          </div>
        </div>

        ${needsCreationGuide ? `
          <div class="rounded-xl border border-projectGold/35 bg-accentDark/20 p-4 flex items-start justify-between gap-4">
            <div>
              <div class="text-sm font-bold text-projectGoldGlow">Some missing setup belongs in Creation Guide</div>
              <div class="text-xs text-zinc-500 mt-1 leading-relaxed">Creation Guide owns new project creation and starter setup files such as project.json and input-map.json. Use it when the wizard flags missing setup owned by Creation Guide.</div>
            </div>
            <a href="../creation-guide/" class="px-3 py-2 rounded-lg border border-projectGold/40 text-xs text-projectGoldGlow hover:bg-accentDark/50 transition flex-shrink-0">Go to Creation Guide</a>
          </div>
        ` : ''}

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div class="lg:col-span-2 bg-cardDark border border-[#2d2d42] rounded-xl p-4 space-y-3">
            ${checks.map((check) => `
              <div class="rounded-lg border ${check.pass ? 'border-projectGreen/35 bg-emerald-950/10' : 'border-orange-500/30 bg-orange-950/10'} p-3 flex items-start justify-between gap-4">
                <div>
                  <div class="text-sm font-bold text-zinc-200">${escapeHtml(check.label)}</div>
                  <div class="text-xs text-zinc-500 mt-1">${escapeHtml(check.detail)}</div>
                  <div class="text-[10px] text-zinc-600 mt-2 font-mono">Fix owner: ${escapeHtml(check.owner)}</div>
                  ${!check.pass && check.creationGuideAction ? '<a href="../creation-guide/" class="inline-flex mt-2 text-[10px] text-projectGoldGlow hover:underline">Open Creation Guide for this setup →</a>' : ''}
                </div>
                <div class="text-[10px] font-mono font-bold ${check.pass ? 'text-projectGreen' : 'text-orange-400'}">${check.pass ? 'PASS' : 'MISSING'}</div>
              </div>
            `).join('')}
          </div>

          <aside class="bg-cardDark border border-projectGold/25 rounded-xl p-4 space-y-4">
            <h3 class="text-sm font-bold text-projectGoldGlow">Recommended order</h3>
            <ol class="text-xs text-zinc-500 space-y-2 list-decimal pl-4 leading-relaxed">
              <li>Create/open project package in Creation Guide.</li>
              <li>Confirm project.json and input-map.json exist.</li>
              <li>Add scenes/screens from Scene Editor.</li>
              <li>Add quests, side quests, and puzzles from their libraries.</li>
              <li>Link library items to Flatplan nodes/routes.</li>
              <li>Run Build Prep health checks.</li>
            </ol>
            <a href="../creation-guide/" class="block text-center rounded-lg border border-projectGold/40 px-3 py-2 text-xs text-projectGoldGlow hover:bg-accentDark/50 transition">Open Creation Guide</a>
            <div class="rounded-lg bg-black/30 border border-[#2d2d42] p-3 text-[10px] text-zinc-500 leading-relaxed">
              Creation Guide owns new project creation. Project Manager only assembles, links, validates, and exports existing project structure.
            </div>
          </aside>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}

export function enhanceProjectUI({ ui, stateManager }) {
  if (!ui || !stateManager) return ui;

  const baseSetWorkspace = ui.setWorkspace.bind(ui);
  const baseWireTopCanvasControls = ui.wireTopCanvasControls.bind(ui);

  ui.renderAssetBrowser = () => renderAssetBrowser({ stateManager, ui });
  ui.renderGettingStartedWizard = () => renderGettingStartedWizard({ stateManager });

  ui.setWorkspace = (workspace) => {
    baseSetWorkspace(workspace);
    const assetBrowserStage = document.getElementById('assetBrowserWorkspace');
    const wizardStage = document.getElementById('wizardWorkspace');
    const flatplanStage = document.getElementById('flatplanCanvas');
    const manifestStage = document.getElementById('manifestWorkspace');
    const stitcherStage = document.getElementById('stitcherWorkspace');
    const buildPrepStage = document.getElementById('buildPrepWorkspace');
    const workspaceLabel = document.getElementById('activeWorkspaceName');

    assetBrowserStage?.classList.toggle('hidden', workspace !== 'assetbrowser');
    wizardStage?.classList.toggle('hidden', workspace !== 'wizard');
    flatplanStage?.classList.toggle('hidden', workspace !== 'flatplan');
    manifestStage?.classList.toggle('hidden', workspace !== 'manifest');
    stitcherStage?.classList.toggle('hidden', workspace !== 'stitcher');
    buildPrepStage?.classList.toggle('hidden', workspace !== 'buildprep');

    if (workspaceLabel) {
      workspaceLabel.textContent = workspace === 'assetbrowser' ? 'ASSET BROWSER' : workspace === 'wizard' ? 'SETUP WIZARD' : workspace.toUpperCase();
    }

    if (workspace === 'assetbrowser') ui.renderAssetBrowser();
    if (workspace === 'wizard') ui.renderGettingStartedWizard();
  };

  ui.wireTopCanvasControls = () => {
    baseWireTopCanvasControls();
    wireMenuBehaviourOnce();

    document.querySelectorAll('[data-library-target]').forEach((button) => {
      button.onclick = () => {
        setStorageItem(INTEGRATION_STORAGE_KEYS.assetBrowserMode, button.dataset.libraryTarget || 'assets');
        ui.setWorkspace('assetbrowser');
        closeAllMenus();
      };
    });
  };

  return ui;
}
