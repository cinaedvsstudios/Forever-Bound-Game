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
        <span class="ready">✅ ${ready} ready</span>
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
        This panel is a Creation Guide readiness view. The deeper cross-app project loading work is now tracked globally in <code>todo_all_apps_active_project_runtime_integration</code>.
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
  wireHealthActionButtons();
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
      description: creator ? creator : 'Creator/studio is useful for exported README and project metadata.',
      owner: 'Creation Guide',
      weight: 0
    },
    {
      title: 'Local project folder',
      state: localPath ? 'ready' : 'missing',
      description: localPath || 'Choose or type where the starter project folder will be unzipped.',
      owner: 'Creation Guide',
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
      title: 'Starter files exported',
      state: gatesComplete ? 'ready' : 'missing',
      description: gatesComplete ? 'Primary index, folders, manifest, flatplan, and indexes are marked complete.' : 'Export Project Folder ZIP has not completed all required setup gates yet.',
      owner: 'Creation Guide',
      weight: 1
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
      title: 'Cross-app project loading',
      state: 'warning',
      description: 'Global task added: other apps must map the active project into their real internal state, not just show the pill.',
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
