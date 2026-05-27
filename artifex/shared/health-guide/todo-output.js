// Artifex shared health to-do output generator
// Converts shared Health Guide reports into project to-do files.

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeSeverity(severity = '') {
  if (severity === 'failed') return 'failed';
  if (severity === 'missing') return 'missing';
  if (severity === 'warning') return 'warning';
  return 'open';
}

function severityToPriority(severity = '') {
  if (severity === 'failed') return 5;
  if (severity === 'missing') return 4;
  if (severity === 'warning') return 3;
  return 2;
}

function checkToTask(check) {
  return {
    taskId: `todo_${check.checkId}`,
    scope: 'project-manager',
    owningModule: 'project-manager',
    relatedModules: check.creationGuideAction ? ['creation-guide'] : [],
    title: check.label,
    description: check.detail,
    status: normalizeSeverity(check.severity),
    priority: severityToPriority(check.severity),
    effort: check.severity === 'failed' ? 3 : 2,
    source: 'shared-health-guide',
    projectFile: null,
    appFile: 'artifex/shared/health-guide/health-checks.js',
    fixOwner: check.fixOwner || check.owner || 'project-manager',
    tags: safeArray(check.tags)
  };
}

export function createProjectManagerTodoOutput(healthReport = {}) {
  const checks = safeArray(healthReport.checks);
  const failedChecks = checks.filter((check) => !check.pass);

  return {
    schemaVersion: 'artifex.todos.v1',
    scope: 'project-manager',
    generatedFrom: 'artifex/shared/health-guide/health-checks.js',
    generatedAt: new Date().toISOString(),
    healthReportScope: healthReport.scope || 'project-manager',
    summary: {
      totalHealthChecks: checks.length,
      openTasks: failedChecks.length,
      hardFailures: failedChecks.filter((check) => check.severity === 'failed').length,
      warnings: failedChecks.filter((check) => check.severity !== 'failed').length,
      needsCreationGuide: failedChecks.some((check) => check.creationGuideAction)
    },
    tasks: failedChecks.map(checkToTask)
  };
}

export function downloadJSONFile(filename, value) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
