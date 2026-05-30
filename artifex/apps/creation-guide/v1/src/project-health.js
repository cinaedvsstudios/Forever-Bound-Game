let healthRenderQueued = false;
let lastHealthHtml = '';

function addHealthToolbarButton() {
  if (document.getElementById('project-health-toolbar-button')) return;
  const toolbar = document.querySelector('.workspace-toolbar');
  const assignments = document.getElementById('open-assignments-toolbar-button');
  if (!toolbar || !assignments) return;
  const button = document.createElement('button');
  button.id = 'project-health-toolbar-button';
  button.type = 'button';
  button.textContent = '🩺 Health';
  button.addEventListener('click', () => {
    queueHealthRender();
    setTimeout(() => document.getElementById('project-health-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 40);
  });
  toolbar.insertBefore(button, assignments.nextSibling);
}

function queueHealthRender() {
  if (healthRenderQueued) return;
  healthRenderQueued = true;
  setTimeout(() => {
    healthRenderQueued = false;
    renderProjectHealthPanel();
  }, 80);
}

function renderProjectHealthPanel() {
  const panel = document.getElementById('project-overview-panel');
  if (!panel) return;
  const checks = getProjectHealthChecks();
  const blocking = checks.filter(check => check.weight > 0);
  const ready = blocking.filter(check => check.state === 'ready').length;
  const percent = blocking.length ? Math.round((ready / blocking.length) * 100) : 0;
  const critical = checks.filter(check => check.state === 'missing' && check.weight > 0).length;
  const warnings = checks.filter(check => check.state === 'warning').length;
  const healthState = critical ? 'Needs setup' : warnings ? 'Ready with notes' : 'Ready';
  const activeName = getCurrentProjectNameForHealth();

  const html = `
    <section id="project-health-panel" class="project-health-panel">
      <header class="project-health-header">
        <div>
          <p>Project readiness</p>
          <h2>🩺 Health Check</h2>
          <span>${safeFlow(activeName)} · ${healthState}</span>
        </div>
        <div class="project-health-score ${critical ? 'missing' : warnings ? 'warning' : 'ready'}">
          <strong>${percent}%</strong>
          <small>${ready}/${blocking.length} required</small>
        </div>
      </header>
      <div class="project-health-summary">
        <span class="ready">✅ ${ready} required ready</span>
        <span class="missing">⚠️ ${critical} required missing</span>
        <span class="warning">⭕ ${warnings} optional notes</span>
      </div>
      <div class="project-health-grid">
        ${checks.map(renderHealthCheckCard).join('')}
      </div>
      <div class="project-health-actions">
        <button type="button" id="health-create-assignments-button">📋 Create Fix Assignments</button>
        <button type="button" id="health-export-report-button">⬇️ Export Health JSON</button>
        <button type="button" id="health-refresh-button">🔄 Refresh</button>
      </div>
      <footer class="project-health-footer">
        This panel reports the current Creation Guide setup state, including connected-folder and optional intake setup. Full cross-app project loading remains tracked globally in <code>todo_all_apps_active_project_runtime_integration</code>.
      </footer>
    </section>`;

  let existing = document.getElementById('project-health-panel');
  if (!existing) {
    existing = document.createElement('section');
    existing.id = 'project-health-panel';
    panel.appendChild(existing);
  }
  if (html !== lastHealthHtml || existing.className !== 'project-health-panel') {
    lastHealthHtml = html;
    existing.outerHTML = html;
  }
  if (typeof wireHealthActionButtons === 'function') wireHealthActionButtons();
}

function renderHealthCheckCard(check) {
  const icons = { ready: '✅', missing: '⚠️', warning: '⭕' };
  return `
    <article class="project-health-card ${check.state}">
      <strong>${icons[check.state] || '•'} ${safeFlow(check.title)}</strong>
      <p>${safeFlow(check.description)}</p>
      <small>${safeFlow(check.owner)}</small>
    </article>`;
}

function getProjectHealthChecks() {
  const projectName = valueFlow('game-title-input');
  const projectId = valueFlow('project-id-input');
  const creator = valueFlow('creator-input');
  const localPath = valueFlow('project-folder-input');
  const onlinePath = valueFlow('online-path-input');
  const deployedUrl = valueFlow('deployed-url-input');
  const useGithub = Boolean(document.getElementById('use-github-input')?.checked);
  const library = readProjectFlowLibrary();
  const activeId = localStorage.getItem(ACTIVE_PROJECT_KEY_FLOW);
  const gatesComplete = ['project-index', 'folders', 'manifest', 'flatplan', 'indexes'].every(id => document.querySelector(`[data-gate="${id}"]`)?.classList.contains('complete'));
  const assignmentText = document.getElementById('assignment-count')?.textContent || '';
  const assignmentCount = Number((assignmentText.match(/\d+/) || ['0'])[0]);
  const folderState = window.ArtifexProjectFolder?.getState?.() || null;
  const folderConnected = folderState?.folderStatus === 'connected';
  const permissionRequired = folderState?.folderStatus === 'permission-required';
  const intakeState = typeof window.getCreationGuideIntakeSetupState === 'function' ? window.getCreationGuideIntakeSetupState() : 'pending';
  const intakeHealth = intakeState === 'ready'
    ? { state: 'ready', description: 'Optional intake source-material folders are ready in the connected project folder.' }
    : intakeState === 'skipped'
      ? { state: 'warning', description: 'Intake setup was skipped for now. Create the folders later when source media is ready.' }
      : { state: 'warning', description: 'Optional: create intake source-material folders or choose Skip for Now.' };

  return [
    {
      title: 'Project identity',
      state: projectName && projectName !== 'Untitled Artifex Adventure' && validSlugFlow(projectId) ? 'ready' : 'missing',
      description: projectName && validSlugFlow(projectId) ? `${projectName} / ${projectId}` : 'Set a proper project name and safe project ID slug.',
      owner: 'Creation Guide',
      weight: 1
    },
    {
      title: 'Creator metadata',
      state: creator ? 'ready' : 'warning',
      description: creator ? creator : 'Creator/studio is useful for README and project metadata.',
      owner: 'Creation Guide',
      weight: 0
    },
    {
      title: 'Connected project folder',
      state: folderConnected ? 'ready' : permissionRequired ? 'missing' : 'missing',
      description: folderConnected ? `Writable folder connected: ${folderState.folderName || localPath || 'project folder'}.` : permissionRequired ? 'The project folder is remembered, but write access must be re-authorised.' : 'Connect a writable project folder so Creation Guide can save starter files directly.',
      owner: 'Creation Guide / Shared Folder Service',
      weight: 1
    },
    {
      title: 'GitHub repo path',
      state: !useGithub ? 'warning' : validUrlFlow(onlinePath) ? 'ready' : 'missing',
      description: !useGithub ? 'Optional: not using GitHub for this project yet.' : validUrlFlow(onlinePath) ? onlinePath : 'Use GitHub is enabled, but the repo URL is missing or invalid.',
      owner: 'Creation Guide / Hub',
      weight: useGithub ? 1 : 0
    },
    {
      title: 'Deployed URL',
      state: !deployedUrl ? 'warning' : validUrlFlow(deployedUrl) ? 'ready' : 'missing',
      description: deployedUrl ? deployedUrl : 'Optional: add a GitHub Pages/live URL later.',
      owner: 'Build Game later',
      weight: deployedUrl ? 1 : 0
    },
    {
      title: 'Starter project structure',
      state: gatesComplete ? 'ready' : 'missing',
      description: gatesComplete ? 'Primary project files, folders and indexes are marked created.' : 'Connect a project folder and click Create Starter Structure. Export ZIP remains available as backup/fallback.',
      owner: 'Creation Guide',
      weight: 1
    },
    {
      title: 'Initial asset intake setup',
      state: intakeHealth.state,
      description: intakeHealth.description,
      owner: 'Creation Guide / Asset Library',
      weight: 0
    },
    {
      title: 'Active project saved',
      state: projectId && activeId === projectId && library[projectId] ? 'ready' : 'missing',
      description: projectId && activeId === projectId && library[projectId] ? `${projectId} is active in the Project Library.` : 'Click Set Active Project so Hub and apps know which project to open.',
      owner: 'Creation Guide / Hub',
      weight: 1
    },
    {
      title: 'Assignments started',
      state: assignmentCount > 0 ? 'ready' : 'warning',
      description: assignmentCount > 0 ? `${assignmentCount} assignment records are available.` : 'No assignments are visible yet. Add starter assignments when setup is stable.',
      owner: 'Creation Guide',
      weight: 0
    },
    {
      title: 'Recommended starting media',
      state: 'warning',
      description: 'Next feature task: track project logo/title mark, backgrounds, characters, objects and UI starter media.',
      owner: 'Creation Guide / Asset Library',
      weight: 0
    },
    {
      title: 'Cross-app project loading',
      state: 'warning',
      description: 'Global task remains open: other apps must load the active project into their real internal state.',
      owner: 'All app owners',
      weight: 0
    }
  ];
}

function getCurrentProjectNameForHealth() {
  const projectName = valueFlow('game-title-input');
  const projectId = valueFlow('project-id-input');
  return projectName || projectId || 'Untitled Artifex Adventure';
}

function getCurrentProjectIdForHealth() {
  return valueFlow('project-id-input') || 'untitled-artifex-adventure';
}
