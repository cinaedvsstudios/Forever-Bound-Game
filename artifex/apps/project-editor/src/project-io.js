import { createHealthReport } from '../../../shared/health-guide/health-checks.js?v=0.1.15-io';

const PROJECT_IO_VERSION = 'artifex.projectPackage.v1';

const PROJECT_PACKAGE_FILES = Object.freeze([
  'project.json',
  'logic.json',
  'layout.json',
  'registry.json',
  'library-links.json',
  'input-map.json',
  'health/latest-health-report.json',
  'todos/project-manager-todos.json'
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function normalizeFilename(name = '') {
  return String(name).replaceAll('\\', '/').split('/').pop().toLowerCase();
}

function getPathKey(file) {
  return String(file.webkitRelativePath || file.name || '').replaceAll('\\', '/').toLowerCase();
}

function prettyJSON(value) {
  return JSON.stringify(value, null, 2);
}

function makeDefaultLibraryLinks(stateManager) {
  return {
    schemaVersion: 'artifex.libraryLinks.v1',
    projectId: stateManager.project?.projectId || 'project_unknown',
    links: []
  };
}

function makeDefaultInputMap(stateManager) {
  return {
    schemaVersion: 'artifex.inputMap.v1',
    profileId: 'input_default_keyboard',
    label: 'Default Keyboard Controls',
    createdBy: 'creation-guide',
    projectId: stateManager.project?.projectId || 'project_unknown',
    actions: [
      { actionId: 'action_move_left', label: 'Move Left', category: 'movement', defaultKeyboard: ['ArrowLeft', 'A'], defaultGamepad: ['DPadLeft', 'LeftStickLeft'], required: true },
      { actionId: 'action_move_right', label: 'Move Right', category: 'movement', defaultKeyboard: ['ArrowRight', 'D'], defaultGamepad: ['DPadRight', 'LeftStickRight'], required: true },
      { actionId: 'action_jump', label: 'Jump', category: 'movement', defaultKeyboard: ['Space'], defaultGamepad: ['A'], required: true },
      { actionId: 'action_interact', label: 'Interact', category: 'gameplay', defaultKeyboard: ['E', 'Enter'], defaultGamepad: ['A'], required: true },
      { actionId: 'action_pick_up', label: 'Pick Up', category: 'gameplay', defaultKeyboard: ['F'], defaultGamepad: ['X'], required: false },
      { actionId: 'action_throw', label: 'Throw', category: 'gameplay', defaultKeyboard: ['Q'], defaultGamepad: ['RightTrigger'], required: false },
      { actionId: 'action_pause', label: 'Pause', category: 'system', defaultKeyboard: ['Escape'], defaultGamepad: ['Start'], required: true }
    ]
  };
}

function makeProjectManagerTodos(healthReport) {
  const checks = Array.isArray(healthReport?.checks) ? healthReport.checks : [];
  return {
    schemaVersion: 'artifex.todos.v1',
    scope: 'project-manager',
    generatedFrom: 'artifex/shared/health-guide/health-checks.js',
    generatedAt: new Date().toISOString(),
    tasks: checks
      .filter((check) => !check.pass)
      .map((check) => ({
        taskId: `todo_${check.checkId}`,
        scope: 'project-manager',
        owningModule: 'project-manager',
        relatedModules: check.creationGuideAction ? ['creation-guide'] : [],
        title: check.label,
        description: check.detail,
        status: check.severity === 'warning' ? 'warning' : 'open',
        priority: check.severity === 'failed' ? 5 : 4,
        effort: 2,
        source: 'health-guide',
        projectFile: null,
        appFile: 'artifex/shared/health-guide/health-checks.js',
        fixOwner: check.fixOwner || check.owner || 'project-manager',
        tags: Array.isArray(check.tags) ? check.tags : []
      }))
  };
}

export function buildProjectPackage(stateManager) {
  const healthReport = createHealthReport({ stateManager, scope: 'project-manager-export' });
  const files = {
    'project.json': clone(stateManager.project),
    'logic.json': clone(stateManager.logic),
    'layout.json': clone(stateManager.layout),
    'registry.json': clone(stateManager.registry),
    'library-links.json': clone(stateManager.state?.libraryLinks) || makeDefaultLibraryLinks(stateManager),
    'input-map.json': clone(stateManager.state?.inputMap) || makeDefaultInputMap(stateManager),
    'health/latest-health-report.json': healthReport,
    'todos/project-manager-todos.json': makeProjectManagerTodos(healthReport)
  };

  return {
    schemaVersion: PROJECT_IO_VERSION,
    generatedAt: new Date().toISOString(),
    files
  };
}

async function writePackageToDirectory(projectPackage) {
  if (!globalThis.showDirectoryPicker) return false;
  const directoryHandle = await globalThis.showDirectoryPicker({ mode: 'readwrite' });

  for (const [path, value] of Object.entries(projectPackage.files)) {
    const parts = path.split('/');
    const filename = parts.pop();
    let currentDir = directoryHandle;

    for (const part of parts) {
      currentDir = await currentDir.getDirectoryHandle(part, { create: true });
    }

    const fileHandle = await currentDir.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(prettyJSON(value));
    await writable.close();
  }

  return true;
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadPackageAsLooseFiles(projectPackage) {
  Object.entries(projectPackage.files).forEach(([path, value], index) => {
    const filename = path.replaceAll('/', '__');
    window.setTimeout(() => downloadTextFile(filename, prettyJSON(value)), index * 150);
  });
}

function showIOToast(message, tone = 'info') {
  const existing = document.getElementById('projectIoToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'projectIoToast';
  toast.className = `fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl border text-xs shadow-card-glow ${tone === 'error' ? 'bg-red-950/90 border-red-500/40 text-red-100' : 'bg-cardDark/95 border-projectGold/40 text-projectGoldGlow'}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 4200);
}

async function readFileText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error(`Could not read ${file.name}`));
    reader.readAsText(file);
  });
}

function applyProjectPackageData({ stateManager, parsedFiles }) {
  const currentCatalog = stateManager.state.catalog;

  if (parsedFiles.project) stateManager.state.project = parsedFiles.project;
  if (parsedFiles.logic) stateManager.state.logic = parsedFiles.logic;
  if (parsedFiles.layout) stateManager.state.layout = parsedFiles.layout;
  if (parsedFiles.registry) stateManager.state.registry = parsedFiles.registry;
  if (parsedFiles.libraryLinks) stateManager.state.libraryLinks = parsedFiles.libraryLinks;
  if (parsedFiles.inputMap) stateManager.state.inputMap = parsedFiles.inputMap;
  if (parsedFiles.healthReport) stateManager.state.healthReport = parsedFiles.healthReport;
  if (parsedFiles.projectTodos) stateManager.state.projectTodos = parsedFiles.projectTodos;

  stateManager.state.catalog = currentCatalog;
  stateManager.selectedNodeId = null;
  stateManager.selectedEdgeId = null;
  stateManager.ensureCameraDefaults?.();
  stateManager.saveToStorage?.();
}

async function parseImportedProjectFiles(fileList) {
  const parsedFiles = {};
  const fileErrors = [];

  for (const file of Array.from(fileList || [])) {
    try {
      const text = await readFileText(file);
      const json = JSON.parse(text);
      const basename = normalizeFilename(file.name);
      const pathKey = getPathKey(file);

      if (json?.schemaVersion === PROJECT_IO_VERSION && json.files) {
        Object.entries(json.files).forEach(([path, value]) => {
          const key = normalizeFilename(path);
          if (key === 'project.json') parsedFiles.project = value;
          if (key === 'logic.json') parsedFiles.logic = value;
          if (key === 'layout.json') parsedFiles.layout = value;
          if (key === 'registry.json') parsedFiles.registry = value;
          if (key === 'library-links.json') parsedFiles.libraryLinks = value;
          if (key === 'input-map.json') parsedFiles.inputMap = value;
          if (path.toLowerCase().endsWith('latest-health-report.json')) parsedFiles.healthReport = value;
          if (path.toLowerCase().endsWith('project-manager-todos.json')) parsedFiles.projectTodos = value;
        });
        continue;
      }

      if (basename === 'project.json') parsedFiles.project = json;
      else if (basename === 'logic.json') parsedFiles.logic = json;
      else if (basename === 'layout.json') parsedFiles.layout = json;
      else if (basename === 'registry.json') parsedFiles.registry = json;
      else if (basename === 'library-links.json' || basename === 'library-links__json') parsedFiles.libraryLinks = json;
      else if (basename === 'input-map.json') parsedFiles.inputMap = json;
      else if (basename === 'latest-health-report.json' || pathKey.endsWith('health/latest-health-report.json')) parsedFiles.healthReport = json;
      else if (basename === 'project-manager-todos.json' || pathKey.endsWith('todos/project-manager-todos.json')) parsedFiles.projectTodos = json;
    } catch (error) {
      fileErrors.push(`${file.name}: ${error.message}`);
    }
  }

  return { parsedFiles, fileErrors };
}

async function importProjectFiles({ stateManager, onRefresh }) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.multiple = true;

  input.addEventListener('change', async () => {
    if (!input.files?.length) return;

    try {
      const { parsedFiles, fileErrors } = await parseImportedProjectFiles(input.files);
      const hasUsableData = Object.keys(parsedFiles).length > 0;

      if (!hasUsableData) {
        showIOToast(fileErrors.length ? `No usable project files imported. ${fileErrors[0]}` : 'No usable project files imported.', 'error');
        return;
      }

      applyProjectPackageData({ stateManager, parsedFiles });
      onRefresh?.();
      showIOToast(`Imported ${Object.keys(parsedFiles).length} project file section(s).`);
    } catch (error) {
      showIOToast(`Import failed: ${error.message}`, 'error');
    }
  }, { once: true });

  input.click();
}

async function exportProjectPackage({ stateManager }) {
  const projectPackage = buildProjectPackage(stateManager);

  try {
    const wroteDirectory = await writePackageToDirectory(projectPackage);
    if (wroteDirectory) {
      showIOToast('Exported split project package to selected folder.');
      return;
    }
  } catch (error) {
    if (error.name === 'AbortError') return;
    console.warn('[ProjectIO] Folder export failed, falling back to loose downloads.', error);
  }

  downloadPackageAsLooseFiles(projectPackage);
  showIOToast('Exported split project files as separate downloads.');
}

function saveCurrentProject({ stateManager }) {
  stateManager.saveToStorage?.();
  showIOToast('Saved current Project Manager state to browser storage.');
}

export function enhanceProjectIO({ ui, stateManager, onRefresh }) {
  if (!ui || !stateManager) return ui;

  const baseWireTopCanvasControls = ui.wireTopCanvasControls.bind(ui);

  ui.wireTopCanvasControls = () => {
    baseWireTopCanvasControls();

    document.querySelectorAll('[data-project-io-action]').forEach((button) => {
      button.onclick = () => {
        const action = button.dataset.projectIoAction;
        if (action === 'import') importProjectFiles({ stateManager, onRefresh });
        if (action === 'save-local') saveCurrentProject({ stateManager });
        if (action === 'export-package') exportProjectPackage({ stateManager });
      };
    });
  };

  ui.exportProjectPackage = () => exportProjectPackage({ stateManager });
  ui.importProjectFiles = () => importProjectFiles({ stateManager, onRefresh });

  return ui;
}

export { PROJECT_PACKAGE_FILES };
