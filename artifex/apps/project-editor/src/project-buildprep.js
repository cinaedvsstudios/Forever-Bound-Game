import { createHealthReport } from '../../../shared/health-guide/health-checks.js?v=0.1.24-build-health';

// Artifex Project Editor Build Prep workspace
// Owns diagnostics and build-readiness checks for the split Project Editor shell.

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getStatusLabel(check) {
  if (check.pass) return '✔ PASSED';
  if (check.severity === 'failed') return '✖ FAILED';
  if (check.severity === 'missing') return '⚠ MISSING';
  return '⚠ WARNING';
}

function getStatusClass(check) {
  if (check.pass) return 'text-projectGreen';
  if (check.severity === 'failed') return 'text-red-300';
  return 'text-orange-400';
}

export function runProjectDiagnostics(stateManager) {
  return createHealthReport({ stateManager, scope: 'project-manager-build-prep' }).checks;
}

export function renderBuildPrepWorkspace({ stateManager, container, onRun }) {
  if (!container || !stateManager) return;

  const report = createHealthReport({ stateManager, scope: 'project-manager-build-prep' });
  const checks = report.checks;
  const summary = report.summary;
  const passCount = summary.passed;
  const warningCount = summary.warnings;
  const failedCount = summary.hardFailures;

  container.innerHTML = `
    <div class="h-full overflow-y-auto p-6 space-y-6">
      <div class="max-w-6xl mx-auto space-y-6">
        <div class="border-b border-[#2d2d42] pb-4 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold tracking-wide text-zinc-100">Build Prep & Shared Health Guide</h2>
            <p class="text-xs text-zinc-500">Validates project structure, route logic, linked libraries, setup files, and export readiness using the shared Artifex Health Guide.</p>
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
                    <span class="text-zinc-200 block font-semibold leading-tight">${escapeHtml(check.label)}</span>
                    <span class="text-[10px] text-zinc-500 block mt-0.5">${escapeHtml(check.owner || check.fixOwner || 'Project Manager')}</span>
                    <span class="text-[9px] text-zinc-600 block mt-1 font-mono">${escapeHtml(check.detail)}</span>
                  </div>
                  <span class="font-mono text-[10px] font-bold ${getStatusClass(check)} flex-shrink-0">
                    ${escapeHtml(getStatusLabel(check))}
                  </span>
                </div>
              `).join('')}
            </div>
            <button id="runBuildPrepBtn" class="w-full bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold py-2.5 rounded text-xs transition flex items-center justify-center space-x-2">
              <i data-lucide="shield-check" class="w-4 h-4"></i>
              <span>Refresh Shared Health Check</span>
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
                <div class="flex justify-between"><span>failures:</span><span class="${failedCount ? 'text-red-300' : 'text-projectGreen'} font-bold">${failedCount}</span></div>
                <div class="flex justify-between"><span>status:</span><span class="${summary.status === 'failed' ? 'text-red-300' : summary.status === 'warning' ? 'text-orange-400' : 'text-projectGreen'} font-bold">${escapeHtml(summary.status)}</span></div>
              </div>
              <div class="text-xs text-zinc-500 leading-relaxed">
                This view now reads from <span class="font-mono text-projectGoldGlow">artifex/shared/health-guide/health-checks.js</span>, so Creation Guide and Build Game can reuse the same checks.
              </div>
            </div>
            <button id="stageBuildBtn" class="w-full mt-4 bg-gradient-to-r from-accentDark to-projectGold hover:brightness-110 border border-projectGold/40 text-white font-bold py-3 rounded-lg text-xs transition flex items-center justify-center space-x-2 shadow-project-glow">
              <i data-lucide="external-link" class="w-4 h-4 text-projectParchment"></i>
              <span>LOG HEALTH REPORT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#runBuildPrepBtn')?.addEventListener('click', () => onRun?.());
  container.querySelector('#stageBuildBtn')?.addEventListener('click', () => {
    console.info('[Project Editor Build Prep] Shared Health Report', report);
    alert('Shared health report logged in console for this split step.');
  });
}
