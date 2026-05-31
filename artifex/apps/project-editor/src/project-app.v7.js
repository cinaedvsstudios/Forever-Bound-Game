import { renderProjectShell } from './project-shell.js?v=0.1.32-contract';
import { PROJECT_THEME, applyProjectTheme, getProjectThemeTailwindConfig } from './project-theme.js?v=0.1.31-tasks';
import { createProjectEditorStateManager } from './project-state.js?v=0.1.32-contract';
import { createProjectCanvasController } from './project-canvas.js?v=0.1.31-tasks';
import { createProjectRenderer } from './project-renderer.js?v=0.1.31-tasks';
import { createProjectUI } from './project-ui.js?v=0.1.31-tasks';
import { createAssetBrowserRenderer, wireProjectIntegrationControls } from './project-integration-ui.js?v=0.1.31-tasks';
import { createNodeLinksInspectorExtension } from './project-node-links-ui.js?v=0.1.31-tasks';
import { createGettingStartedRenderer } from './project-health-ui.js?v=0.1.31-tasks';
import { createProjectIOController, wireProjectIO } from './project-io.js?v=0.1.32-contract';
import { renderStitcherWorkspace } from './project-stitcher.js?v=0.1.31-tasks';
import { renderBuildPrepWorkspace } from './project-buildprep.js?v=0.1.31-tasks';
import { getTypeStyle } from './data/type-styles.js?v=0.1.31-tasks';

const PROJECT_EDITOR_VERSION = 'v0.1.32 CONTRACT';

applyProjectTheme();
renderProjectShell({ version: PROJECT_EDITOR_VERSION });

const state = createProjectEditorStateManager();
let canvas = null;
let renderer = null;
let ui = null;

window.ArtifexProjectTheme = PROJECT_THEME;
window.applyProjectTheme = applyProjectTheme;
window.getProjectThemeTailwindConfig = getProjectThemeTailwindConfig;
window.ArtifexProjectEditorState = state.state;
window.ProjectEditorStateManager = state;

function setVersion() {
  document.querySelectorAll('#projectEditorVersionBadge, [data-project-version-badge]').forEach((el) => {
    el.textContent = PROJECT_EDITOR_VERSION;
  });
  document.title = `Artifex Project Editor ${PROJECT_EDITOR_VERSION} - Flatplan`;
}

function refresh({ soft = false } = {}) {
  ui?.renderCatalog();
  renderer?.renderGraph();
  ui?.renderJsonPreview();
  ui?.renderInspectorPreview();
  ui?.wireTopCanvasControls();
  if (!soft && state.activeWorkspace === 'stitcher') renderStitcher();
  if (!soft && state.activeWorkspace === 'buildprep') renderBuildPrep();
  if (!soft && state.activeWorkspace === 'tasks') ui?.renderTasksWorkspace?.();
  if (!soft && state.activeWorkspace === 'assetbrowser') ui?.renderAssetBrowser?.();
  if (!soft && state.activeWorkspace === 'wizard') ui?.renderGettingStartedWizard?.();
  if (window.lucide) window.lucide.createIcons();
}

function redrawGraphOnly() {
  renderer?.drawRoutes();
  ui?.renderJsonPreview();
  ui?.renderInspectorPreview();
  if (window.lucide) window.lucide.createIcons();
}

function renderStitcher() {
  renderStitcherWorkspace({
    stateManager: state,
    container: document.getElementById('stitcherWorkspace'),
    onChange: (opts = {}) => {
      renderer?.drawRoutes();
      ui?.renderJsonPreview();
      if (!opts.soft) renderStitcher();
      if (window.lucide) window.lucide.createIcons();
    }
  });
  if (window.lucide) window.lucide.createIcons();
}

function renderBuildPrep() {
  renderBuildPrepWorkspace({
    stateManager: state,
    container: document.getElementById('buildPrepWorkspace'),
    onRun: () => renderBuildPrep()
  });
  if (window.lucide) window.lucide.createIcons();
}

function init() {
  setVersion();
  canvas = createProjectCanvasController({
    stateManager: state,
    canvasElement: document.getElementById('flatplanCanvas'),
    viewportElement: document.getElementById('canvasViewport'),
    onNodeMoved: () => redrawGraphOnly(),
    onNodeSelected: () => ui?.renderInspectorPreview(),
    onInteractionEnd: () => redrawGraphOnly(),
    onCameraChanged: () => ui?.renderJsonPreview()
  });

  renderer = createProjectRenderer({
    stateManager: state,
    theme: PROJECT_THEME,
    getTypeStyle,
    canvasController: canvas,
    nodesContainer: document.getElementById('nodesContainer'),
    svgLayer: document.getElementById('svgEdgeLayer'),
    onSelectionChanged: () => refresh(),
    onNodeMoved: () => redrawGraphOnly(),
    onInteractionEnd: () => redrawGraphOnly()
  });

  const io = createProjectIOController({ stateManager: state, onRefresh: () => refresh() });
  const workspaceRenderers = {
    assetbrowser: createAssetBrowserRenderer({ stateManager: state, getUI: () => ui }),
    wizard: createGettingStartedRenderer({ stateManager: state })
  };

  ui = createProjectUI({
    stateManager: state,
    getTypeStyle,
    renderer,
    canvasController: canvas,
    onRefresh: (opts) => refresh(opts),
    onGraphChanged: () => redrawGraphOnly(),
    renderStitcher,
    renderBuildPrep,
    workspaceRenderers,
    inspectorExtensions: [createNodeLinksInspectorExtension({ stateManager: state, getUI: () => ui })],
    afterWireTopCanvasControls: [
      () => wireProjectIntegrationControls({ ui }),
      () => wireProjectIO({ stateManager: state, onRefresh: () => refresh() })
    ]
  });

  ui.exportProjectPackage = io.exportProjectPackage;
  ui.importProjectFiles = io.importProjectFiles;

  ui.setWorkspace(state.activeWorkspace || 'flatplan');
  refresh();
  console.info(`[Artifex Project Editor] ${PROJECT_EDITOR_VERSION} loaded`, {
    nodes: state.logic.nodes.length,
    routes: state.logic.routes.length
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
