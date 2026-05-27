import { renderProjectShell } from './project-shell.js?v=0.1.22-inspector-links';
import { PROJECT_THEME, applyProjectTheme, getProjectThemeTailwindConfig } from './project-theme.js?v=0.1.22-inspector-links';
import { createProjectEditorStateManager } from './project-state.js?v=0.1.22-inspector-links';
import { createProjectCanvasController } from './project-canvas.js?v=0.1.22-inspector-links';
import { createProjectRenderer } from './project-renderer.js?v=0.1.22-inspector-links';
import { createProjectUI } from './project-ui.js?v=0.1.22-inspector-links';
import { enhanceProjectUI } from './project-integration-ui.js?v=0.1.22-inspector-links';
import { enhanceNodeLinkInspector } from './project-node-links-ui.js?v=0.1.22-inspector-links';
import { enhanceProjectHealthUI } from './project-health-ui.js?v=0.1.22-inspector-links';
import { enhanceProjectIO } from './project-io.js?v=0.1.22-inspector-links';
import { renderStitcherWorkspace } from './project-stitcher.js?v=0.1.22-inspector-links';
import { renderBuildPrepWorkspace } from './project-buildprep.js?v=0.1.22-inspector-links';
import { getTypeStyle } from './data/type-styles.js?v=0.1.22-inspector-links';

applyProjectTheme();
renderProjectShell({ version: 'v0.1.22 INSPECTOR LINKS' });

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
    el.textContent = 'v0.1.22 INSPECTOR LINKS';
  });
}

function refresh({ soft = false } = {}) {
  ui?.renderCatalog();
  renderer?.renderGraph();
  ui?.renderJsonPreview();
  ui?.renderInspectorPreview();
  ui?.wireTopCanvasControls();
  if (!soft && state.activeWorkspace === 'stitcher') renderStitcher();
  if (!soft && state.activeWorkspace === 'buildprep') renderBuildPrep();
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

function renderStitcher(change = {}) {
  renderStitcherWorkspace({
    stateManager: state,
    container: document.getElementById('stitcherWorkspace'),
    onChange: (opts = {}) => {
      renderer?.drawRoutes();
      ui?.renderJsonPreview();
      if (!opts.soft) renderStitcher(opts);
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

  ui = enhanceProjectIO({
    ui: enhanceProjectHealthUI({
      ui: enhanceProjectUI({
        ui: enhanceNodeLinkInspector({
          ui: createProjectUI({
            stateManager: state,
            getTypeStyle,
            renderer,
            canvasController: canvas,
            onRefresh: () => refresh(),
            onGraphChanged: () => redrawGraphOnly(),
            renderStitcher,
            renderBuildPrep
          }),
          stateManager: state
        }),
        stateManager: state
      }),
      stateManager: state
    }),
    stateManager: state,
    onRefresh: () => refresh()
  });

  ui.setWorkspace(state.activeWorkspace || 'flatplan');
  refresh();
  console.info('[Artifex Project Editor] v0.1.22 INSPECTOR LINKS loaded', {
    nodes: state.logic.nodes.length,
    routes: state.logic.routes.length
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
