const HEALTH_ACTIONS_VERSION = 'V1.1.8';
const HEALTH_ACTIONS_KEY_PREFIX = 'artifex.creationGuide.healthAssignmentsCreated.';
let healthActionsReady = false;
let healthActionsQueued = false;

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    applyHealthActionsVersion();
    installHealthActions();
  }, 120);
});

function applyHealthActionsVersion() {
  const badge = document.getElementById('version-badge');
  if (badge) badge.textContent = HEALTH_ACTIONS_VERSION;
  document.title = `Artifex Creation Guide ${HEALTH_ACTIONS_VERSION}`;
}

function installHealthActions() {
  injectHealthActionStyles();
  queueHealthActionsPatch();
  if (healthActionsReady) return;
  healthActionsReady = true;
  const observer = new MutationObserver(() => {
    applyHealthActionsVersion();
    queueHealthActionsPatch();
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

function queueHealthActionsPatch() {
  if (healthActionsQueued) return;
  healthActionsQueued = true;
  setTimeout(() => {
    healthActionsQueued = false;
    patchHealthPanelActions();
  }, 60);
}

function patchHealthPanelActions() {
  const panel = document.getElementById('project-health-panel');
  if (!panel || panel.querySelector('.project-health-actions')) return;

  const footer = panel.querySelector('.project-health-footer') || panel;
  const actions = document.createElement('div');
  actions.className = 'project-health-actions';
  actions.innerHTML = `
    <button type="button" id="health-create-assignments-button">📋 Create Fix Assignments</button>
    <button type="button" id="health-export-report-button">⬇️ Export Health JSON</button>
    <button type="button" id="health-refresh-button">🔄 Refresh</button>
  `;
  footer.parentElement?.insertBefore(actions, footer);

  document.getElementById('health-create-assignments-button')?.addEventListener('click', createHealthAssignments);
  document.getElementById('health-export-report-button')?.addEventListener('click', exportHealthReport);
  document.getElementById('health-refresh-button')?.addEventListener('click', () => {
    if (typeof queueHealthRender === 'function') queueHealthRender();
    setHealthActionStatus('Health check refreshed.');
  });
}

function createHealthAssignments() {
  const checks = getHealthActionChecks().filter((check) => check.state !== 'ready');
  const assignable = checks.filter((check) => check.title !== 'Assignments started');
  if (!assignable.length) {
    setHealthActionStatus('No missing health items need assignments right now.');
    return;
  }

  if (typeof addAssignment !== 'function' || typeof render !== 'function') {
    setHealthActionStatus('Assignment functions are not available yet. Reload and try again.');
    return;
  }

  const projectId = getHealthActionProjectId();
  const storageKey = `${HEALTH_ACTIONS_KEY_PREFIX}${projectId}`;
  const created = readCreatedHealthAssignmentTitles(storageKey);
  let added = 0;

  assignable.forEach((check) => {
    const title = `Health: ${check.title}`;
    if (created.includes(title)) return;
    addAssignment({
      title,
      primaryModule: moduleForHealthOwner(check.owner),
      state: check.state === 'missing' && check.weight > 0 ? 'blocked' : 'unassigned',
      owner: '',
      priority: check.state === 'missing' && check.weight > 0 ? 5 : 3,
      effort: check.weight > 0 ? 2 : 1,
      milestone: 'Project Setup / Health',
      zone: 'Creation Guide',
      notes: `${check.description}\n\nGenerated from the Creation Guide Health Check.`,
      subtasks: [
        'Review the related Health Check card',
        'Open the relevant setup field or tool',
        'Fix or confirm the project data',
        'Refresh the Health Check panel'
      ]
    });
    created.push(title);
    added += 1;
  });

  localStorage.setItem(storageKey, JSON.stringify(created, null, 2));
  render();
  if (typeof queueHealthRender === 'function') queueHealthRender();
  setHealthActionStatus(added ? `Created ${added} health assignment${added === 1 ? '' : 's'}.` : 'Health assignments already exist for the current missing items.');
}

function exportHealthReport() {
  const checks = getHealthActionChecks();
  const report = {
    schemaVersion: 'artifex.health-report.v1',
    generatedAt: new Date().toISOString(),
    projectId: getHealthActionProjectId(),
    projectName: valueForHealthAction('game-title-input') || 'Untitled Artifex Adventure',
    summary: {
      requiredTotal: checks.filter((check) => check.weight > 0).length,
      requiredReady: checks.filter((check) => check.weight > 0 && check.state === 'ready').length,
      requiredMissing: checks.filter((check) => check.weight > 0 && check.state === 'missing').length,
      optionalWarnings: checks.filter((check) => check.state === 'warning').length
    },
    checks
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.projectId || 'artifex-project'}-health-report.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setHealthActionStatus('Exported health report JSON.');
}

function getHealthActionChecks() {
  if (typeof getProjectHealthChecks === 'function') return getProjectHealthChecks();
  return [...document.querySelectorAll('.project-health-card')].map((card) => ({
    title: card.querySelector('strong')?.textContent?.replace(/^[✅⚠️⭕•]\s*/, '').trim() || 'Health item',
    description: card.querySelector('p')?.textContent || '',
    owner: card.querySelector('small')?.textContent || 'Creation Guide',
    state: card.classList.contains('missing') ? 'missing' : card.classList.contains('warning') ? 'warning' : 'ready',
    weight: card.classList.contains('missing') ? 1 : 0
  }));
}

function moduleForHealthOwner(owner) {
  const text = String(owner || '').toLowerCase();
  if (text.includes('scene')) return 'scene-editor';
  if (text.includes('quest')) return 'quest-builder';
  if (text.includes('effect')) return 'effect-editor';
  if (text.includes('object')) return 'object-creator';
  if (text.includes('project editor') || text.includes('flatplan') || text.includes('manifest')) return 'project-editor';
  return 'unassigned';
}

function getHealthActionProjectId() {
  return valueForHealthAction('project-id-input') || 'untitled-artifex-adventure';
}

function valueForHealthAction(id) {
  return String(document.getElementById(id)?.value || '').trim();
}

function readCreatedHealthAssignmentTitles(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setHealthActionStatus(message) {
  const status = document.getElementById('status-text');
  if (status) status.textContent = message;
  if (typeof toast === 'function') toast(message);
}

function injectHealthActionStyles() {
  if (document.getElementById('health-action-style')) return;
  const style = document.createElement('style');
  style.id = 'health-action-style';
  style.textContent = `
    .project-health-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(226,204,167,.12);
    }
    .project-health-actions button {
      font-size: 11px !important;
      padding: 7px 10px !important;
      border-radius: 999px;
    }
    @media (max-width: 760px) {
      .project-health-actions { justify-content: flex-start; }
    }
  `;
  document.head.appendChild(style);
}
