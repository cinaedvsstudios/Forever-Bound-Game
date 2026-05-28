function wireHealthActionButtons() {
  document.getElementById('health-create-assignments-button')?.addEventListener('click', createHealthAssignments);
  document.getElementById('health-export-report-button')?.addEventListener('click', exportHealthReport);
  document.getElementById('health-refresh-button')?.addEventListener('click', () => {
    queueHealthRender();
    setHealthActionStatus('Health check refreshed.');
  });
}

function createHealthAssignments() {
  const checks = getProjectHealthChecks().filter((check) => check.state !== 'ready');
  const assignable = checks.filter((check) => check.title !== 'Assignments started');
  if (!assignable.length) {
    setHealthActionStatus('No missing health items need assignments right now.');
    return;
  }

  if (typeof addAssignment !== 'function' || typeof render !== 'function') {
    setHealthActionStatus('Assignment functions are not available yet. Reload and try again.');
    return;
  }

  const projectId = getCurrentProjectIdForHealth();
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
  queueHealthRender();
  setHealthActionStatus(added ? `Created ${added} health assignment${added === 1 ? '' : 's'}.` : 'Health assignments already exist for the current missing items.');
}

function exportHealthReport() {
  const checks = getProjectHealthChecks();
  const required = checks.filter((check) => check.weight > 0);
  const report = {
    schemaVersion: 'artifex.health-report.v1',
    generatedAt: new Date().toISOString(),
    projectId: getCurrentProjectIdForHealth(),
    projectName: valueFlow('game-title-input') || 'Untitled Artifex Adventure',
    summary: {
      requiredTotal: required.length,
      requiredReady: required.filter((check) => check.state === 'ready').length,
      requiredMissing: required.filter((check) => check.state === 'missing').length,
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

function moduleForHealthOwner(owner) {
  const text = String(owner || '').toLowerCase();
  if (text.includes('scene')) return 'scene-editor';
  if (text.includes('quest')) return 'quest-builder';
  if (text.includes('effect')) return 'effect-editor';
  if (text.includes('object')) return 'object-creator';
  if (text.includes('project editor') || text.includes('flatplan') || text.includes('manifest')) return 'project-editor';
  return 'unassigned';
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
