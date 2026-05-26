// Artifex Project Editor Build Prep workspace
// Step 7 of the Project Editor real split.
//
// Owns diagnostics and build-readiness checks for the split Project Editor shell.

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function runProjectDiagnostics(stateManager) {
  const nodeIds = new Set(stateManager.logic.nodes.map((node) => node.id));
  const layoutIds = new Set(stateManager.layout.nodes.map((node) => node.id));
  const connectedIds = new Set();
  const invalidRoutes = [];

  for (const route of stateManager.logic.routes) {
    if (!nodeIds.has(route.source) || !nodeIds.has(route.target)) invalidRoutes.push(route.id);
    connectedIds.add(route.source);
    connectedIds.add(route.target);
  }

  const orphanedNodes = stateManager.logic.nodes
    .filter((node) => !connectedIds.has(node.id))
    .map((node) => node.id);

  const missingLayout = stateManager.logic.nodes
    .filter((node) => !layoutIds.has(node.id))
    .map((node) => node.id);

  const startScreenExists = nodeIds.has(stateManager.project.startScreen);

  return [
    {
      id: 'start-screen',
      name: 'Verify Project Launch Start Screen',
      desc: 'Start screen target node exists and can be used as the launch point.',
      pass: startScreenExists,
      detail: startScreenExists ? stateManager.project.startScreen : `Missing ${stateManager.project.startScreen}`
    },
    {
      id: 'orphaned-nodes',
      name: 'Audit Orphaned / Unconnected Nodes',
      desc: 'Loose nodes are allowed during drafting but should be reviewed before build.',
      pass: orphanedNodes.length === 0,
      detail: orphanedNodes.length ? orphanedNodes.join(', ') : 'No orphaned nodes'
    },
    {
      id: 'invalid-routes',
      name: 'Validate Route Endpoints',
      desc: 'Each route source and target must resolve to an existing node.',
      pass: invalidRoutes.length === 0,
      detail: invalidRoutes.length ? invalidRoutes.join(', ') : 'All routes resolve'
    },
    {
      id: 'layout-sync',
      name: 'Verify Layout Positioning References',
      desc: 'Every logic node should have a matching layout node record.',
      pass: missingLayout.length === 0,
      detail: missingLayout.length ? missingLayout.join(', ') : 'Layout is synced'
    }
  ];
}

export function renderBuildPrepWorkspace({ stateManager, container, onRun }) {
  if (!container || !stateManager) return;

  const checks = runProjectDiagnostics(stateManager);
  const passCount = checks.filter((check) => check.pass).length;
  const warningCount = checks.length - passCount;

  container.innerHTML = `
    <div class="h-full overflow-y-auto p-6 space-y-6">
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="border-b border-[#2d2d42] pb-4 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold tracking-wide text-zinc-100">Build Prep & Diagnostics</h2>
            <p class="text-xs text-zinc-500">Validate graph structure and stage Project Editor output readiness.</p>
          </div>
          <i data-lucide="package-check" class="w-6 h-6 text-projectGreen"></i>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="md:col-span-2 bg-cardDark border border-[#2d2d42] rounded-lg p-5 space-y-4">
            <h3 class="text-sm font-bold text-zinc-200 flex items-center space-x-2 border-b border-[#2d2d42] pb-2">
              <i data-lucide="activity" class="w-4 h-4 text-projectGreen"></i>
              <span>Project Health Scan</span>
            </h3>
            <div class="space-y-3">
              ${checks.map((check) => `
                <div class="p-3 rounded bg-black/25 border border-[#2d2d42]/30 text-xs flex justify-between items-start gap-4">
                  <div>
                    <span class="text-zinc-200 block font-semibold leading-tight">${escapeHtml(check.name)}</span>
                    <span class="text-[10px] text-zinc-500 block mt-0.5">${escapeHtml(check.desc)}</span>
                    <span class="text-[9px] text-zinc-600 block mt-1 font-mono">${escapeHtml(check.detail)}</span>
                  </div>
                  <span class="font-mono text-[10px] font-bold ${check.pass ? 'text-projectGreen' : 'text-orange-400'} flex-shrink-0">
                    ${check.pass ? '✔ PASSED' : '⚠ WARNING'}
                  </span>
                </div>
              `).join('')}
            </div>
            <button id="runBuildPrepBtn" class="w-full bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold py-2.5 rounded text-xs transition flex items-center justify-center space-x-2">
              <i data-lucide="shield-check" class="w-4 h-4"></i>
              <span>Execute Project Health Check</span>
            </button>
          </div>

          <div class="bg-cardDark border border-[#2d2d42] rounded-lg p-5 flex flex-col justify-between">
            <div class="space-y-4">
              <h3 class="text-sm font-bold text-zinc-200 border-b border-[#2d2d42] pb-2 flex items-center space-x-2">
                <i data-lucide="package" class="w-4 h-4 text-projectGreen"></i>
                <span>Build Compilation</span>
              </h3>
              <div class="bg-black/30 rounded p-3 border border-[#2d2d42]/60 font-mono text-[10px] text-zinc-400 space-y-2">
                <div class="flex justify-between"><span>nodes:</span><span class="text-projectGoldGlow font-bold">${stateManager.logic.nodes.length}</span></div>
                <div class="flex justify-between"><span>routes:</span><span class="text-projectGoldGlow font-bold">${stateManager.logic.routes.length}</span></div>
                <div class="flex justify-between"><span>checks:</span><span class="text-projectGreen font-bold">${passCount}/${checks.length}</span></div>
                <div class="flex justify-between"><span>warnings:</span><span class="${warningCount ? 'text-orange-400' : 'text-projectGreen'} font-bold">${warningCount}</span></div>
              </div>
              <div class="text-xs text-zinc-500 leading-relaxed">
                This step validates structure only. Final export and build staging are handled by the IO/build step.
              </div>
            </div>
            <button id="stageBuildBtn" class="w-full mt-4 bg-gradient-to-r from-accentDark to-projectGold hover:brightness-110 border border-projectGold/40 text-white font-bold py-3 rounded-lg text-xs transition flex items-center justify-center space-x-2 shadow-project-glow">
              <i data-lucide="external-link" class="w-4 h-4 text-projectParchment"></i>
              <span>STAGE BUILD SNAPSHOT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#runBuildPrepBtn')?.addEventListener('click', () => onRun?.());
  container.querySelector('#stageBuildBtn')?.addEventListener('click', () => {
    console.info('[Project Editor Build Prep] Snapshot', stateManager.exportSnapshot());
    alert('Build snapshot staged in console for this split step.');
  });
}
