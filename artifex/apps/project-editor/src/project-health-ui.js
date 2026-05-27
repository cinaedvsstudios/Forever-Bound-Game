import { createHealthReport } from '../../../shared/health-guide/health-checks.js?v=0.1.14-health';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderGettingStartedWizardFromSharedHealth({ stateManager }) {
  const container = document.getElementById('wizardWorkspace');
  if (!container) return;

  const report = createHealthReport({ stateManager, scope: 'project-manager-getting-started' });
  const checks = report.checks || [];
  const summary = report.summary || { passed: 0, total: checks.length, needsCreationGuide: false };
  const needsCreationGuide = Boolean(summary.needsCreationGuide);

  container.innerHTML = `
    <div class="h-full overflow-y-auto p-6">
      <div class="max-w-5xl mx-auto space-y-5">
        <div class="border-b border-[#2d2d42] pb-4 flex items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-bold tracking-wide text-zinc-100">Getting Started / Missing Setup Wizard</h2>
            <p class="text-xs text-zinc-500">Now powered by the shared Artifex Health Guide. It inspects the current project package and shows missing setup.</p>
          </div>
          <div class="flex items-center gap-3">
            ${needsCreationGuide ? '<a href="../creation-guide/" class="px-3 py-2 rounded-lg border border-projectGold/40 bg-accentDark/35 text-xs text-projectGoldGlow hover:bg-accentDark/60 transition">Open Creation Guide</a>' : ''}
            <div class="text-right">
              <div class="text-2xl font-black text-projectGoldGlow">${summary.passed}/${summary.total}</div>
              <div class="text-[10px] text-zinc-500 font-mono">checks passed</div>
            </div>
          </div>
        </div>

        ${needsCreationGuide ? `
          <div class="rounded-xl border border-projectGold/35 bg-accentDark/20 p-4 flex items-start justify-between gap-4">
            <div>
              <div class="text-sm font-bold text-projectGoldGlow">Some missing setup belongs in Creation Guide</div>
              <div class="text-xs text-zinc-500 mt-1 leading-relaxed">Creation Guide owns new project creation and starter setup files such as project.json and input-map.json. Project Manager shows the missing pieces but should not create a brand-new project.</div>
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
                  <div class="text-[10px] text-zinc-600 mt-2 font-mono">Fix owner: ${escapeHtml(check.owner || check.fixOwner)}</div>
                  ${!check.pass && check.creationGuideAction ? '<a href="../creation-guide/" class="inline-flex mt-2 text-[10px] text-projectGoldGlow hover:underline">Open Creation Guide for this setup →</a>' : ''}
                </div>
                <div class="text-[10px] font-mono font-bold ${check.pass ? 'text-projectGreen' : 'text-orange-400'}">${check.pass ? 'PASS' : escapeHtml(String(check.severity || 'MISSING').toUpperCase())}</div>
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
              Shared health source: <span class="font-mono text-projectGoldGlow">artifex/shared/health-guide/health-checks.js</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}

export function enhanceProjectHealthUI({ ui, stateManager }) {
  if (!ui || !stateManager) return ui;

  ui.renderGettingStartedWizard = () => renderGettingStartedWizardFromSharedHealth({ stateManager });

  return ui;
}
